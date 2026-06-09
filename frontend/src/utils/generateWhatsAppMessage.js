export const generateWhatsAppMessage = (cart, total, userName = "Cliente") => {
  // Formatear fecha
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = now
    .toLocaleString("es-CO", { month: "short" })
    .toUpperCase()
    .slice(0, 3);
  const year = now.getFullYear();

  const time = now.toLocaleString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = `${day}/${month}/${year}, ${time}`;

  // Generar líneas de productos con emoji y formato limpio
  const productLines = cart
    .map((item) => {
      const unitPrice = item.precioDescuento || item.precio;
      const totalItem = unitPrice * item.cantidad;
      // Productos
      return `🧬 *${item.nombre}* (x${item.cantidad}) = $${totalItem.toLocaleString("es-CO")}`;
    })
    .join("\n");

  // PLANTILLA CON EMOJIS
  return (
    `🛒 *Nuevo pedido - LyF Grupo Farmacéutico*\n\n` +
    `📅 *Fecha:* ${formattedDate}\n` +
    `👤 *Cliente:* ${userName}\n\n` +
    `📋 *Detalle del pedido:*\n` +
    `${productLines}\n\n` +
    `💰 *Total:* $${total.toLocaleString("es-CO")}\n\n` +
    `🙏 ¡Gracias por su atención!`
  );
};
