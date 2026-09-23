import { MessagesSquare, Send, Smartphone, Users, Ticket, ShoppingBag, BarChart3, Bot, Wrench } from 'lucide-react';

const ICONS = { MessagesSquare, Send, Smartphone, Users, Ticket, ShoppingBag, BarChart3, Bot, Wrench };

export default function CategoryIcon({ name, size = 20 }) {
  const Icon = ICONS[name] || Wrench;
  return <Icon size={size} aria-hidden="true" />;
}
