export function PantallaPosVendedor() {
  return (
    <section className="grid">
      <article className="card col-8">
        <h2>Punto de Venta - Vendedor</h2>
        <p>Cliente, búsqueda por código/nombre, carrito temporal, ITBIS y envío a cajero.</p>
      </article>
      <article className="card col-4">
        <h3>Resumen</h3>
        <p>Subtotal, ITBIS, Total</p>
        <button className="btn btn-primary">Enviar al cajero</button>
      </article>
    </section>
  );
}
