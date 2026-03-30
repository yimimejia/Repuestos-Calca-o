export function BandejaCaja() {
  return (
    <section className="card">
      <h2>Bandeja del Cajero</h2>
      <table className="tabla">
        <thead><tr><th>Turno</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr><td>V-001</td><td>Consumidor final</td><td>Vendedor Demo</td><td>RD$ 0.00</td><td><span className="estado estado-pendiente">pendiente</span></td><td><button className="btn btn-primary">Cobrar</button></td></tr>
        </tbody>
      </table>
    </section>
  );
}
