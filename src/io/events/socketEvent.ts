import SocketNamespace from "../namespaces/SocketNamespace";
import SocketHandler from "../handlers/SocketHandler";

const socketEvent = new SocketNamespace();

socketEvent.onConnection(SocketHandler.onConnection.bind(SocketHandler));
socketEvent.register("sendMessage", SocketHandler.sendMessage.bind(SocketHandler));
socketEvent.register("markAsRead", SocketHandler.markAsRead.bind(SocketHandler));
socketEvent.register("disconnect", SocketHandler.disconnect.bind(SocketHandler));

export default socketEvent;