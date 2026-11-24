
using CafeReceiptGenerator.Models;
using Microsoft.Playwright;
using System.Globalization;
using System.Net;
using System.Text;

namespace CafeReceiptGenerator.Services;

public class CafeReceiptPdfGenerator : IAsyncDisposable
{
    private IPlaywright? _playwright;
    private IBrowser? _browser;

    private readonly IWebHostEnvironment _environment;

    public CafeReceiptPdfGenerator(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    private readonly SemaphoreSlim _lock = new(1, 1);

    public async Task<byte[]> GenerateAsync(
        CafeReceipt receipt,
        CancellationToken cancellationToken = default)
    {
        Validate(receipt);

        await _lock.WaitAsync(cancellationToken);

        try
        {
            await EnsureBrowserAsync();

            var page = await _browser!.NewPageAsync();

            try
            {
                await page.SetContentAsync(
                    BuildHtml(receipt),
                    new PageSetContentOptions
                    {
                        WaitUntil = WaitUntilState.NetworkIdle
                    });

                var height = await page.EvaluateAsync<double>(
                    "() => document.documentElement.scrollHeight");

                var heightMm = Math.Max(80, height * 25.4 / 96 + 8);

                return await page.PdfAsync(new PagePdfOptions
                {
                    Width = "80mm",
                    Height = $"{heightMm.ToString(
                        "0.##",
                        CultureInfo.InvariantCulture)}mm",

                    PrintBackground = true,

                    Margin = new Margin
                    {
                        Top = "3mm",
                        Bottom = "3mm",
                        Left = "3mm",
                        Right = "3mm"
                    }
                });
            }
            finally
            {
                await page.CloseAsync();
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task EnsureBrowserAsync()
    {
        if (_browser is { IsConnected: true })
            return;

        _playwright ??= await Playwright.CreateAsync();

        _browser = await _playwright.Chromium.LaunchAsync(
            new BrowserTypeLaunchOptions
            {
                Headless = true
            });
    }

    private static void Validate(CafeReceipt receipt)
    {
        ArgumentNullException.ThrowIfNull(receipt);

        if (receipt.Items == null || receipt.Items.Count == 0)
            throw new ArgumentException("No products found.");

        if (receipt.Items.Any(x =>
            string.IsNullOrWhiteSpace(x.Name) ||
            x.Quantity <= 0 ||
            x.UnitPrice < 0))
        {
            throw new ArgumentException("Invalid product data.");
        }

        var subtotal = receipt.Items.Sum(
            x => x.Quantity * x.UnitPrice);

        if (receipt.Discount < 0 || receipt.Discount > subtotal)
            throw new ArgumentException("Invalid discount.");

        if (receipt.TaxRate < 0 || receipt.TaxRate > 100)
            throw new ArgumentException("Invalid tax rate.");
    }

    private string? GetLogoBase64(string? logoPath)
    {
        if (string.IsNullOrWhiteSpace(logoPath))
            return null;

        // Convert /images/logoDark.png to a physical path
        var relativePath = logoPath.TrimStart('/')
                                   .Replace('/', Path.DirectorySeparatorChar);

        var physicalPath = Path.Combine(
            _environment.WebRootPath,
            relativePath
        );

        if (!File.Exists(physicalPath))
            throw new FileNotFoundException(
                $"Logo not found at: {physicalPath}"
            );

        var extension = Path.GetExtension(physicalPath).ToLowerInvariant();

        var mimeType = extension switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            _ => throw new NotSupportedException("Unsupported logo format.")
        };

        var imageBytes = File.ReadAllBytes(physicalPath);

        return $"data:{mimeType};base64,{Convert.ToBase64String(imageBytes)}";
    }

    private string BuildHtml(CafeReceipt r)
    {
        var date = r.IssuedAt ?? DateTime.Now;

        var invoice = string.IsNullOrWhiteSpace(r.InvoiceNumber)
            ? $"R-{date:yyyyMMdd-HHmmss}"
            : r.InvoiceNumber;

        var subtotal = r.Items.Sum(
            x => x.Quantity * x.UnitPrice);

        var afterDiscount = subtotal - r.Discount;

        var tax = afterDiscount * r.TaxRate / 100m;

        var total = afterDiscount + tax;

        var items = new StringBuilder();

        var logo = "";

        foreach (var item in r.Items)
        {
            items.Append($"""
        <div class="item">
            <div class="product">
                {E(item.Name)}
            </div>

            <div class="item-details">
                <span>
                    {item.Quantity:0.##} × {Money(item.UnitPrice)}
                </span>

                <strong>
                    {Money(item.Quantity * item.UnitPrice)}
                </strong>
            </div>
        </div>
        """);
        }

        var logoBase64 = GetLogoBase64("/images/logo.png");

        if (!string.IsNullOrWhiteSpace(logoBase64))
        {
            logo = $"<img class='logo' src='{logoBase64}'>";
        }

        var details = new StringBuilder();

        AddDetail(details, "Invoice", "رقم الفاتورة", invoice);
        AddDetail(details, "Date", "التاريخ", date.ToString("yyyy-MM-dd HH:mm"));
        AddDetail(details, "Cashier", "الكاشير", r.CashierName);
        AddDetail(details, "Customer", "العميل", r.CustomerName);
        AddDetail(details, "Order", "نوع الطلب", r.OrderType);
        AddDetail(details, "Table", "الطاولة", r.TableNumber);
        AddDetail(details, "Payment", "الدفع", r.PaymentMethod);

        var taxRow = r.TaxRate > 0
            ? TotalRow("Tax", "الضريبة", tax, r.Currency)
            : "";

        var discountRow = r.Discount > 0
            ? TotalRow("Discount", "الخصم", -r.Discount, r.Currency)
            : "";

        return $$"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <style>
                @page {
                    size: 80mm auto;
                    margin: 0;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 3mm;
                    width: 80mm;
                    background: white;
                    color: #111;
                    font-family:
                        Calibri,
                        "Noto Sans Arabic",
                        "DejaVu Sans",
                        Arial,
                        sans-serif;
                    font-size: 11px;
                    line-height: 1.5;
                }

                .header {
                    text-align: center;
                }

                .logo {
                    object-fit: contain;
                    font-family: 
                        "Noto Sans Arabic",
                        "DejaVu Sans",
                        Arial,
                        sans-serif;
                }

                .brand {
                    font-size: 23px;
                    font-weight: 900;
                    letter-spacing: 2px;
                }

                .title {
                    font-size: 13px;
                    font-weight: bold;
                    margin-top: 8px;
                }

                .divider {
                    border-top: 1px dashed #555;
                    margin: 9px 0;
                }

                .details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail {
                    display: flex;
                    justify-content: space-between;
                    gap: 5px;
                }

                .label {
                    color: #555;
                }

                .value {
                    font-weight: bold;
                    text-align: right;
                    overflow-wrap: anywhere;
                }

                .section-title {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin: 8px 0;
                }

                .item {
                    padding: 6px 0;
                    border-bottom: 1px dotted #aaa;
                }

                .product {
                    font-weight: bold;
                }

                .item-details {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 3px;
                    color: #444;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                }

                .grand-total {
                    font-size: 16px;
                    font-weight: 900;
                    border-top: 1px solid black;
                    margin-top: 8px;
                    padding-top: 8px;
                }

                .ar {
                    direction: rtl;
                    unicode-bidi: isolate;
                }

                .footer {
                    text-align: center;
                    font-weight: bold;
                    margin-top: 12px;
                }
            </style>
        </head>

        <body>

            <header class="header">

                <img src={{logoBase64}} class="logo" width="150" />

                <div class="brand">
                    Tafé
                </div>

                <div class="title">
                    SALES RECEIPT • إيصال بيع
                </div>

            </header>

            <div class="divider"></div>

            <section class="details">
                {{details}}
            </section>

            <div class="divider"></div>

            <div class="section-title">
                <span>ITEMS</span>
                <span class="ar">الأصناف</span>
            </div>

            {{items}}

            <div style="margin-top: 8px">

                {{TotalRow("Subtotal", "الإجمالي", subtotal, "EGP")}}

                {{discountRow}}

                {{taxRow}}

                <div class="total-row grand-total">
                    <span>TOTAL / الإجمالي</span>
                    <strong>{{Money(total)}} EGP</strong>
                </div>

            </div>

            <div class="divider"></div>

            <footer class="footer">

                <div>
                    {{E(RandomQutes.GetRandomQute(RandomQutes.enFooter))}}
                </div>

                <div class="ar">
                    {{E(RandomQutes.GetRandomQute(RandomQutes.arFooter))}}
                </div>

            </footer>

        </body>
        </html>
        """;
    }

    private static void AddDetail(
        StringBuilder sb,
        string en,
        string ar,
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return;

        sb.Append($"""
            <div class="detail">
                <span class="label">
                    {E(en)} / <span class="ar">{E(ar)}</span>
                </span>

                <span class="value">
                    {E(value)}
                </span>
            </div>
            """);
    }

    private static string TotalRow(
        string en,
        string ar,
        decimal amount,
        string currency)
    {
        return $"""
            <div class="total-row">
                <span>
                    {E(en)} / <span class="ar">{E(ar)}</span>
                </span>

                <strong>{Money(amount)} {E(currency)}</strong>
            </div>
            """;
    }

    private static string Money(decimal amount)
    {
        return amount.ToString(
            "N2",
            CultureInfo.InvariantCulture);
    }

    private static string E(string value)
    {
        return WebUtility.HtmlEncode(value);
    }

    public async ValueTask DisposeAsync()
    {
        if (_browser != null)
            await _browser.DisposeAsync();

        _playwright?.Dispose();

        _lock.Dispose();
    }
}
