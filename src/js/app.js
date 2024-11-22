
import TicketsList from "./TicketsList";
import Controller from "./Controller";

const container = document.getElementById("container");
const ticketsList = new TicketsList(container);

const controller = new Controller(ticketsList);
controller.init();
