
namespace CafeReceiptGenerator.Models;

public class CafeReceipt
{
    public string BusinessName { get; set; } = "TAFÉ";

    public string? LogoPath { get; set; }

    public string? InvoiceNumber { get; set; }

    public DateTime? IssuedAt { get; set; }

    public string? CashierName { get; set; }

    public string? CustomerName { get; set; }

    public string? OrderType { get; set; }

    public string? TableNumber { get; set; }

    public string? PaymentMethod { get; set; }

    public string Currency { get; set; } = "EGP";

    public decimal Discount { get; set; }

    public decimal TaxRate { get; set; }

    public List<CafeReceiptItem> Items { get; set; } = [];

    public string FooterMessage { get; set; }
        = "Thank you for visiting!";

    public string ArabicFooterMessage { get; set; }
        = "شكراً لزيارتكم";
}

public class CafeReceiptItem
{
    public string Name { get; set; } = "";

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}
