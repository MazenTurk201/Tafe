#nullable disable

namespace Tafe.DTOs
{
    public class PurchaseInvoiceDTO
    {
        public string InvoiceNumber { get; set; }
        public int SupplierId { get; set; }
        public decimal Total { get; set; }
        public List<PurchaseInvoiceItemDTO> Items { get; set; } = new List<PurchaseInvoiceItemDTO>();
    }
}
