// COMPONENTE REUTILIZABLE PARA MÉTRICAS
export const MetricaTarjeta = ({ title, value, icon, style }) => {
  return (
    <div
      className={`p-5 rounded-md shadow-md ${style} hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
        </div>
        <div className="p-3 bg-bgOscuro/5 rounded-md text-primario">{icon}</div>
      </div>
    </div>
  );
};
