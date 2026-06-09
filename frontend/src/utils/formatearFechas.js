export const formatearFechas = () => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString, showDate = true, showTime = true) => {
    if (!dateString) return "N/A";
    const parts = [];
    if (showDate) parts.push(formatDate(dateString));
    if (showTime) parts.push(formatTime(dateString));
    return parts.join(" · ");
  };

  return { formatDate, formatTime, formatDateTime };
};
