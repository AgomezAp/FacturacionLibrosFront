import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { jsPDF } from 'jspdf';

import { AuthService } from '../../services/auth.service';
import { FacturacionService } from '../../services/facturacion.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-factura',
  imports: [ CommonModule, FormsModule,NavbarComponent],
  templateUrl: './factura.component.html',
  styleUrl: './factura.component.css'
})
export class FacturaComponent implements OnInit {
  factura: any = {
    seller: '',
    clientName: '',
    clientID: '',
    clientgmail: '',
    clientciudad: '',
    clientdireccion: '',
    clienttelefono: '',
    price: 0,
    units: 1,
    gift: false,
    tipodepago: '',
    total: 0,
    fecha: new Date().toISOString() // Formato ISO para la fecha
  };
  sales: any[] = [];
  showSalesData = true;
  errorMessage: string = '';
  successMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  sellerStock: number = 0;
  constructor(private facturacion: FacturacionService,private authService: AuthService,private userService: UserService) {}

  ngOnInit() {
    this.obtenerVentas();
    this.calculateTotal();
    const userId = this.authService.getUserId();
    if (userId) {
      this.factura.seller = userId; // Asignar el ID del usuario al vendedor
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.factura.sellerName = `${user.nombre} ${user.apellido}`;
          this.sellerStock = user.stock ?? 0; // Asignar el stock del vendedor
        },
        (error) => {
          this.errorMessage = 'Error al obtener la información del vendedor';
        }
      );
    } else {
      // Manejar el caso en que no se encuentre el ID del usuario
      this.errorMessage = 'No se pudo obtener el ID del usuario';
    }
  }

  onSubmit() {
    console.log("submitForm called");
    if (
      this.factura.seller == '' ||
      this.factura.clientName == '' ||
      this.factura.clientID == '' ||
      this.factura.clientgmail == '' ||
      this.factura.clientciudad == '' ||
      this.factura.clientdireccion == '' ||
      this.factura.clienttelefono == '' ||
      this.factura.price == 0 ||
      this.factura.tipodepago == ''
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      console.log(this.errorMessage);
      return;
    }
    if (this.factura.units > this.sellerStock) {
      this.errorMessage = 'Las unidades exceden el stock disponible';
      console.log(this.errorMessage);
      return;
    }
    this.facturacion.registrarFactura(this.factura).subscribe(
      (response) => {
        alert("Factura registrada correctamente");
        this.successMessage = 'Factura registrada correctamente';
        this.errorMessage = '';
        this.obtenerVentas(); // Recargar las ventas después de registrar una nueva factura
        this.downloadInvoice(); // Generar el PDF después de registrar la factura
        this.resetForm();
      },
      (error) => {
        this.errorMessage = 'Error al registrar la factura';
        this.successMessage = '';
        console.log(this.factura.sellerName)
        console.log(this.factura.clientID)
        console.log(this.factura.clientName)
        console.log(this.factura.clientgmail)
        console.log(this.factura.clientciudad)
        console.log(this.factura.clientdireccion)
        console.log(this.factura.clienttelefono)
        console.log(this.factura.units)
        console.log(this.factura.price)
        console.log(this.factura.gift)
        console.log(this.factura.tipodepago)
        console.log(this.errorMessage);

      }
    );
  }
  resetForm(): void {
    this.factura = {
      seller: '',
      clientName: '',
      clientID: '',
      clientgmail: '',
      clientciudad: '',
      clientdireccion: '',
      clienttelefono: '',
      price: '',
      units: 1,
      gift: false,
      tipodepago: '',
      total: 0,
      fecha: new Date().toISOString() // Formato ISO para la fecha
    };
  }

  calculateTotal(): void {
    const price = parseInt(this.factura.price, 10);
    const units = this.factura.units;
    const total = price * units;
    this.factura.total = this.formatNumber(total);
  }
  formatNumber(value: number): string {
    return value.toLocaleString('es-CO');
  }
  obtenerVentas(): void {
    this.facturacion.getFactura().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.sales = data;
        } else {
          console.error("LA RESPUESTA NO ES UN ARRAY");
        }
      },
      (error: any) => {
        console.error("ERROR AL OBTENER LAS VENTAS");
      }
    );
  }

  toggleSalesData() {
    this.showSalesData = !this.showSalesData;
  }

  get paginatedSales(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.sales.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.sales.length) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  downloadInvoice() {
    const doc = new jsPDF();

    // Base64 de la imagen (reemplaza esta cadena con tu imagen en Base64)
    const imgData = "WhatsApp Image 2025-01-13 at 5.03.52 PM.jpeg";
    
    // Agregar la imagen de fondo
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // Ajustar dimensiones para tamaño A4

    // Datos del cliente
    const { seller, clientName, clientID, clientgmail, clientciudad, clientdireccion, clienttelefono, price, units, gift, tipodepago, total } = this.factura;
    const invoiceNumber = '12345'; // Puedes generar un número de factura dinámico
    const invoiceDate = new Date().toLocaleDateString();

    // Encabezado (membrete)
    doc.setFontSize(50);
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.text("Tarot Latinoamerica", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Dirección: Calle 14 #23-52, Ciudad de Pereira", 105, 22, { align: "center" });
    doc.text("Teléfono: +57 123 456 7890 | Email: contacto@tarotlatinoamerica.com", 105, 28, { align: "center" });
    doc.text("Compañía: ANDRÉS PUBLICIDAD TG S.A.S | NIT: 10001010010101", 105, 34, { align: "center" });

    // Línea de separación
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 43, 200, 43);

    // Información principal
    doc.setFontSize(16);
    doc.text("Factura de Venta", 105, 50, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Número de Factura: ${invoiceNumber}`, 20, 60);
    doc.text(`${invoiceDate}`, 130, 60);

    // Datos del cliente
    doc.setFontSize(14);
    doc.text("Datos del Cliente", 20, 70);

    doc.setFontSize(12);
    doc.text(`Nombre: ${clientName}`, 20, 80);
    doc.text(`ID: ${clientID}`, 20, 86);
    doc.text(`Correo: ${clientgmail}`, 20, 92);
    doc.text(`Ciudad: ${clientciudad}`, 20, 98);
    doc.text(`Dirección: ${clientdireccion}`, 20, 104);
    doc.text(`Teléfono: ${clienttelefono}`, 20, 110);

    // Detalles de la venta
    doc.setFontSize(14);
    doc.text("Detalles de la Venta", 20, 120);

    doc.setFontSize(12);
    doc.text(`Vendedor: ${seller}`, 20, 130);
    doc.text(`Precio Unitario: ${price}`, 20, 136);
    doc.text(`Unidades: ${units}`, 20, 142);
    doc.text(`Incluyó Regalo: ${gift ? 'Sí' : 'No'}`, 20, 148);
    doc.text(`Tipo de pago: ${tipodepago}`, 20, 154);
    doc.text(`Total a Pagar: ${total}`, 20, 160);

    // Pie de página
    doc.setFontSize(10);
    doc.text("Gracias por su compra. ¡Esperamos verlo pronto!", 105, 200, { align: "center" });

    // Descargar el PDF
    doc.save(`Factura_${clientName.replace(/\s+/g, '_')}.pdf`);
  }
}
