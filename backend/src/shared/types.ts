export type Rol = 'vendedor' | 'cajero' | 'administrador' | 'al_por_mayor';

export type EstadoVenta =
  | 'borrador'
  | 'pendiente_de_cobro'
  | 'enviada_a_caja'
  | 'en_caja'
  | 'cobrada'
  | 'aprobada_a_credito'
  | 'cuenta_por_cobrar'
  | 'parcialmente_pagada'
  | 'pagada_total'
  | 'anulada';
