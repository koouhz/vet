// src/views/Agendar/voucherService.js
import { jsPDF } from "jspdf";

export function generarVoucherCita({ servicio, veterinario, mascota, fecha, hora }) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("🐾 Voucher de Cita Veterinaria 🐾", 20, 20);

  // Detalles
  doc.setFontSize(12);
  doc.text(`Servicio: ${servicio?.titulo || '—'}`, 20, 40);
  doc.text(`Veterinario: ${veterinario?.usuarios?.nombre_completo || '—'}`, 20, 50);
  doc.text(`Mascota: ${mascota?.nombre || '—'}`, 20, 60);
  doc.text(`Fecha: ${fecha}`, 20, 70);
  doc.text(`Hora: ${hora}`, 20, 80);

  // Mensaje final
  doc.setFontSize(10);
  doc.text("Gracias por confiar en nosotros. ¡Tu mascota será atendida!", 20, 100);

  // Guardar PDF
  doc.save(`Voucher_${fecha}_${hora}.pdf`);
}
