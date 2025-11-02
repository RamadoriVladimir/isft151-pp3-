import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

export default class CollaborativeWebSocketServer {
    constructor(httpServer) {
        this.wss = new WebSocketServer({ 
            server: httpServer,
            path: "/ws"
        });
        
        this.clients = new Map();
        this.rooms = new Map();
        
        this.initialize();
    }

    initialize() {
        console.log("WebSocket Server inicializado en /ws");

        this.wss.on("connection", this.handleConnection.bind(this));
        
        this.wss.on("error", function(error) {
            console.error("Error en WebSocket Server:", error);
        });
    }

    handleConnection(ws, req) {
        console.log("Nueva conexión WebSocket");

        const token = this.extractTokenFromRequest(req);
        
        if (!token) {
            console.log("Conexión rechazada: No se proporcionó token");
            ws.close(1008, "Token no proporcionado");
            return;
        }

        const userData = this.verifyToken(token);
        
        if (!userData) {
            console.log("Conexión rechazada: Token inválido");
            ws.close(1008, "Token inválido");
            return;
        }

        const clientId = this.generateClientId();
        const clientInfo = {
            ws: ws,
            id: clientId,
            userId: userData.id,
            email: userData.email,
            room: "main",
            isAlive: true
        };

        this.clients.set(clientId, clientInfo);
        this.joinRoom(clientId, "main");

        console.log(`Cliente conectado: ${userData.email} (${clientId})`);

        this.sendToClient(clientId, {
            type: "connected",
            clientId: clientId,
            message: "Conectado exitosamente"
        });

        this.broadcastToRoom("main", {
            type: "user_joined",
            userId: userData.id,
            email: userData.email
        }, clientId);

        ws.on("message", this.handleMessage.bind(this, clientId));
        ws.on("close", this.handleClose.bind(this, clientId));
        ws.on("error", this.handleError.bind(this, clientId));
        ws.on("pong", this.handlePong.bind(this, clientId));

        this.startHeartbeat(clientId);
    }

    extractTokenFromRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        
        if (token) {
            return token;
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.slice(7);
        }

        return null;
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            return decoded;
        } catch (err) {
            console.error("Error verificando token:", err.message);
            return null;
        }
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message.toString());
            console.log(`Mensaje recibido de ${clientId}:`, data.type);

            switch (data.type) {
                case "mold_created":
                    this.handleMoldCreated(clientId, data);
                    break;
                case "mold_updated":
                    this.handleMoldUpdated(clientId, data);
                    break;
                case "mold_deleted":
                    this.handleMoldDeleted(clientId, data);
                    break;
                case "canvas_object_added":
                    this.handleCanvasObjectAdded(clientId, data);
                    break;
                case "canvas_object_moved":
                    this.handleCanvasObjectMoved(clientId, data);
                    break;
                case "canvas_object_removed":
                    this.handleCanvasObjectRemoved(clientId, data);
                    break;
                case "canvas_cleared":
                    this.handleCanvasCleared(clientId, data);
                    break;
                case "ping":
                    this.sendToClient(clientId, { type: "pong" });
                    break;
                default:
                    console.warn(`Tipo de mensaje no reconocido: ${data.type}`);
            }
        } catch (err) {
            console.error("Error procesando mensaje:", err);
        }
    }

    handleMoldCreated(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "mold_created",
            mold: data.mold,
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleMoldUpdated(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "mold_updated",
            mold: data.mold,
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleMoldDeleted(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "mold_deleted",
            moldId: data.moldId,
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleCanvasObjectAdded(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "canvas_object_added",
            object: data.object,
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleCanvasObjectMoved(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "canvas_object_moved",
            objectId: data.objectId,
            x: data.x,
            y: data.y,
            rotation: data.rotation,
            scale: data.scale,
            userId: client.userId
        }, clientId);
    }

    handleCanvasObjectRemoved(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "canvas_object_removed",
            objectId: data.objectId,
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleCanvasCleared(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        this.broadcastToRoom(client.room, {
            type: "canvas_cleared",
            userId: client.userId,
            email: client.email
        }, clientId);
    }

    handleClose(clientId) {
        const client = this.clients.get(clientId);
        
        if (client) {
            console.log(`Cliente desconectado: ${client.email} (${clientId})`);
            
            this.broadcastToRoom(client.room, {
                type: "user_left",
                userId: client.userId,
                email: client.email
            }, clientId);

            this.leaveRoom(clientId, client.room);
            this.clients.delete(clientId);
        }
    }

    handleError(clientId, error) {
        console.error(`Error en cliente ${clientId}:`, error);
    }

    handlePong(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.isAlive = true;
        }
    }

    startHeartbeat(clientId) {
        const interval = setInterval(function() {
            const client = this.clients.get(clientId);
            
            if (!client) {
                clearInterval(interval);
                return;
            }

            if (!client.isAlive) {
                console.log(`Cliente ${clientId} no responde, cerrando conexión`);
                client.ws.terminate();
                clearInterval(interval);
                return;
            }

            client.isAlive = false;
            client.ws.ping();
        }.bind(this), 30000);
    }

    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        
        if (client && client.ws.readyState === 1) {
            try {
                client.ws.send(JSON.stringify(data));
            } catch (err) {
                console.error(`Error enviando mensaje a cliente ${clientId}:`, err);
            }
        }
    }

    broadcastToRoom(roomName, data, excludeClientId = null) {
        const room = this.rooms.get(roomName);
        
        if (!room) return;

        room.forEach(function(clientId) {
            if (clientId !== excludeClientId) {
                this.sendToClient(clientId, data);
            }
        }.bind(this));
    }

    joinRoom(clientId, roomName) {
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
        }

        this.rooms.get(roomName).add(clientId);
        console.log(`Cliente ${clientId} se unio a la sala ${roomName}`);
    }

    leaveRoom(clientId, roomName) {
        const room = this.rooms.get(roomName);
        
        if (room) {
            room.delete(clientId);
            
            if (room.size === 0) {
                this.rooms.delete(roomName);
            }
        }
    }

    getConnectedClients() {
        return Array.from(this.clients.values()).map(function(client) {
            return {
                id: client.id,
                userId: client.userId,
                email: client.email,
                room: client.room
            };
        });
    }

    shutdown() {
        console.log("Cerrando WebSocket Server");
        
        this.clients.forEach(function(client) {
            client.ws.close(1001, "Servidor cerrandose");
        });

        this.wss.close();
    }
}