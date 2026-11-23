using CafeReceiptGenerator.Models;
using CafeReceiptGenerator.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin, Manager")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        [HttpPost("receipt")]
        public async Task<IActionResult> GenerateReceipt(
    [FromBody] CafeReceipt receipt,
    [FromServices] CafeReceiptPdfGenerator generator,
    CancellationToken cancellationToken)
        {
            try
            {
                var pdf = await generator.GenerateAsync(
                    receipt,
                    cancellationToken);

                return File(
                    pdf,
                    "application/pdf",
                    $"{receipt.InvoiceNumber ?? "receipt"}.pdf"
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
