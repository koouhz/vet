// src/views/Agendar/voucherService.js
import { jsPDF } from "jspdf";

export async function generarVoucherCita({ servicio, veterinario, mascota, fecha, hora }) {
  const doc = new jsPDF();

  // Cargar logo (asegúrate de usar la ruta correcta a tu logo)
  const logo = await fetch("/src/assets/img/logo.png")
    .then((res) => res.blob())
    .then((blob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });

  // Agregar logo centrado
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(logo, "PNG", pageWidth / 2 - 20, 10, 40, 40); // 40x40 px centrado

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Voucher de Cita Veterinaria", pageWidth / 2, 60, { align: "center" });

  // Línea divisoria
  doc.setDrawColor(200);
  doc.line(20, 65, pageWidth - 20, 65);

  // Estilo de etiquetas
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100); // gris suave para etiquetas

  const startY = 80;
  const lineHeight = 12;

  // Etiquetas
  doc.text("Servicio:", 20, startY);
  doc.text("Veterinario:", 20, startY + lineHeight);
  doc.text("Mascota:", 20, startY + lineHeight * 2);
  doc.text("Fecha:", 20, startY + lineHeight * 3);
  doc.text("Hora:", 20, startY + lineHeight * 4);

  // Valores
  doc.setTextColor(20); // negro para valores
  doc.setFont("helvetica", "bold");
  doc.text(servicio?.titulo || "—", 60, startY);
  doc.text(veterinario?.usuarios?.nombre_completo || "—", 60, startY + lineHeight);
  doc.text(mascota?.nombre || "—", 60, startY + lineHeight * 2);
  doc.text(fecha, 60, startY + lineHeight * 3);
  doc.text(hora, 60, startY + lineHeight * 4);

  // Mensaje final
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "Gracias por confiar en nosotros. ¡Tu mascota será atendida con amor! 🐾",
    pageWidth / 2,
    160,
    { align: "center" }
  );

  // Guardar PDF
  doc.save(`Voucher_${fecha}_${hora}.pdf`);
}
