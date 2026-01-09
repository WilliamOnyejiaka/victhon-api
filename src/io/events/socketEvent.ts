import SocketNamespace from "../namespaces/SocketNamespace";
import SocketHandler from "../handlers/SocketHandler";

const socketEvent = new SocketNamespace();

socketEvent.onConnection(SocketHandler.onConnection.bind(SocketHandler));
socketEvent.register("sendMessage", SocketHandler.sendMessage.bind(SocketHandler));
socketEvent.register("enterChat", SocketHandler.enterChat.bind(SocketHandler));
socketEvent.register("leaveChat", SocketHandler.leaveChat.bind(SocketHandler));
socketEvent.register("markAsRead", SocketHandler.markAsRead.bind(SocketHandler));
socketEvent.register("typing", SocketHandler.typing.bind(SocketHandler));
socketEvent.register("deleteMessages", SocketHandler.deleteMessages.bind(SocketHandler));
socketEvent.register("disconnect", SocketHandler.disconnect.bind(SocketHandler));

export default socketEvent;