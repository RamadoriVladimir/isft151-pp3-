export default class WebSocketService {
    constructor() {
        this.ws = null;
        this.token = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
        this.messageQueue = [];
    }

    connect(token) {
        if (this.ws && this.isConnected) {
            console.log("Ya existe una conexión activa");
            return;
        }

        this.token = token;
        const wsUrl = `ws://192.168.100.24:3000/ws?token=${encodeURIComponent(token)}`;

        console.log("Conectando a WebSocket");

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);
    }

    handleOpen(event) {
        console.log("Conexión WebSocket establecida");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        this.flushMessageQueue();

        this.emit("connected", { timestamp: new Date() });
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log("Mensaje recibido:", data.type);

            this.emit(data.type, data);
        } catch (err) {
            console.error("Error procesando mensaje WebSocket:", err);
        }
    }

    handleClose(event) {
        console.log("Conexión WebSocket cerrada", event.code, event.reason);
        this.isConnected = false;

        this.emit("disconnected", { 
            code: event.code, 
            reason: event.reason 
        });

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else {
            console.error("Máximo de intentos de reconexión alcanzado");
            this.emit("reconnect_failed", {});
        }
    }

    handleError(error) {
        console.error("Error en WebSocket:", error);
        this.emit("error", { error: error });
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        console.log(`Reintentando conexión en ${this.reconnectDelay / 1000}s (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(function() {
            if (this.token) {
                this.connect(this.token);
            }
        }.bind(this), this.reconnectDelay);
    }

    send(type, data) {
        const message = {
            type: type,
            ...data,
            timestamp: new Date().toISOString()
        };

        if (!this.isConnected) {
            console.log("WebSocket no conectado, encolando mensaje");
            this.messageQueue.push(message);
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (err) {
            console.error("Error enviando mensaje:", err);
            this.messageQueue.push(message);
            return false;
        }
    }

    flushMessageQueue() {
        if (this.messageQueue.length === 0) return;

        console.log(`Enviando ${this.messageQueue.length} mensajes encolados`);

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                this.ws.send(JSON.stringify(message));
            } catch (err) {
                console.error("Error enviando mensaje encolado:", err);
                this.messageQueue.unshift(message);
                break;
            }
        }
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        this.listeners.get(eventType).push(callback);
    }

    off(eventType, callback) {
        if (!this.listeners.has(eventType)) return;

        const callbacks = this.listeners.get(eventType);
        const index = callbacks.indexOf(callback);

        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(eventType, data) {
        if (!this.listeners.has(eventType)) return;

        const callbacks = this.listeners.get(eventType);
        callbacks.forEach(function(callback) {
            try {
                callback(data);
            } catch (err) {
                console.error(`Error en callback de ${eventType}:`, err);
            }
        });
    }

    notifyMoldCreated(mold) {
        this.send("mold_created", { mold: mold });
    }

    notifyMoldUpdated(mold) {
        this.send("mold_updated", { mold: mold });
    }

    notifyMoldDeleted(moldId) {
        this.send("mold_deleted", { moldId: moldId });
    }

    notifyCanvasObjectAdded(object) {
        this.send("canvas_object_added", { object: object });
    }

    notifyCanvasObjectMoved(objectId, x, y, rotation, scale) {
        this.send("canvas_object_moved", {
            objectId: objectId,
            x: x,
            y: y,
            rotation: rotation,
            scale: scale
        });
    }

    notifyCanvasObjectRemoved(objectId) {
        this.send("canvas_object_removed", { objectId: objectId });
    }

    notifyCanvasCleared() {
        this.send("canvas_cleared", {});
    }

    disconnect() {
        if (this.ws) {
            console.log("Cerrando conexión WebSocket");
            this.isConnected = false;
            this.reconnectAttempts = this.maxReconnectAttempts;
            this.ws.close(1000, "Desconexión solicitada por el cliente");
            this.ws = null;
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length
        };
    }
}