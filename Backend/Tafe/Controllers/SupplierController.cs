using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin, Manager")]
    public class SuppliersController : ControllerBase
    {
        private readonly GenericRepo repo;

        public SuppliersController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [HttpGet]
        public IActionResult GetSuppliers()
        {
            return Ok(repo.GetAll<Supplier>().Where(u => !u.IsDeleted)
                .Select(u => new { 
                    u.Id,
                    u.Name,
                    u.Phone,
                    u.Email,
                    u.Address
                    }
                )
            );
        }
        [HttpPost]
        public async Task<IActionResult> CreateSupplier(SupplierCreateDTO supplier)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Supplier { Name = supplier.Name, Email = supplier.Email, Phone = supplier.Phone, Address = supplier.Address });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            await repo.SoftDelete<Supplier>(id);
            await repo.Save();
            return Ok();
        }
        [HttpPatch]
        public async Task<IActionResult> PatchSupplier(SupplierDTO supplier)
        {
            var Supplierr = repo.Get<Supplier>(supplier.Id);
            if (Supplierr == null)
            {
                return NotFound();
            }

            Supplierr.Name = supplier.Name;
            Supplierr.Address = supplier.Address;
            Supplierr.Email = supplier.Email;
            Supplierr.Phone = supplier.Phone;
            await repo.Update(Supplierr);
            await repo.Save();

            return Ok();
        }
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreSupplier(int id)
        {
            var Supplier = repo.Get<Supplier>(id);

            await repo.Restore<Supplier>(id);
            await repo.Save();

            return Ok(Supplier);
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedSuppliers()
        {
            return Ok(repo.GetAllDeleted<Supplier>()
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Phone,
                    u.Email,
                    u.Address
                    }));
        }
        [HttpGet("{id}/PurchaseInvoices")]
        public IActionResult GetSupplierPurchaseInvoices(int id)
        {
            var supplier = repo.Get<Supplier>(id);
            if (supplier == null)
            {
                return NotFound();
            }

            return Ok(supplier.PurchaseInvoices.Select(pi => new
            {
                pi.Id,
                pi.InvoiceNumber,
                pi.Total,
                pi.CreatedAt,
                Items = pi.Items.Select(item => new
                {
                    item.Id,
                    item.IngredientId,
                    IngredientName = item.Ingredient.Name,
                    item.Quantity,
                    item.UnitPrice,
                    item.Total
                })
            }));
        }
        [HttpGet("PurchaseInvoices")]
        public IActionResult GetPurchaseInvoices()
        {
            List<PurchaseInvoice> purchaseInvoices = repo.GetAll<PurchaseInvoice>();
            if (purchaseInvoices == null)
            {
                return NotFound();
            }

            return Ok(purchaseInvoices.Select(pi => new
            {
                pi.Id,
                pi.InvoiceNumber,
                pi.SupplierId,
                SupplierName = pi.Supplier.Name,
                pi.Total,
                pi.CreatedAt,
                Items = pi.Items.Select(item => new
                {
                    item.Id,
                    item.IngredientId,
                    IngredientName = item.Ingredient.Name,
                    item.Quantity,
                    item.UnitPrice,
                    item.Total
                })
            }));
        }
        [HttpPost("PurchaseInvoices")]
public async Task<IActionResult> CreatePurchaseInvoice(PurchaseInvoiceDTO dto)
{
    var supplier = repo.Get<Supplier>(dto.SupplierId);

    if (supplier == null)
    {
        return NotFound("Supplier not found.");
    }

    if (dto.Items == null || dto.Items.Count == 0)
    {
        return BadRequest("Invoice must contain at least one item.");
    }

    foreach (var item in dto.Items)
    {
        var ingredient = repo.Get<Ingredient>(item.IngredientId);

        if (ingredient == null)
        {
            return NotFound(
                $"Ingredient with ID {item.IngredientId} not found."
            );
        }

        if (item.Quantity <= 0)
        {
            return BadRequest(
                $"Quantity for ingredient {item.IngredientId} must be greater than 0."
            );
        }

        if (item.Price < 0)
        {
            return BadRequest(
                $"Price for ingredient {item.IngredientId} cannot be negative."
            );
        }
    }

    var purchaseInvoice = new PurchaseInvoice
    {
        InvoiceNumber = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
        SupplierId = dto.SupplierId,

        Total = dto.Items.Sum(i => i.Quantity * i.Price),

        Items = dto.Items.Select(i => new PurchaseInvoiceItem
        {
            IngredientId = i.IngredientId,
            Quantity = i.Quantity,
            UnitPrice = i.Price,
            Total = i.Quantity * i.Price
        }).ToList()
    };

    // Save invoice first so Id is generated
    repo.Add(purchaseInvoice);
    await repo.Save();

    // Now purchaseInvoice.Id is available
    foreach (var item in purchaseInvoice.Items)
    {
        var stockTransaction = new StockTransaction
        {
            IngredientId = item.IngredientId,
            Quantity = item.Quantity,
            Type = StockTransactionType.Purchase,
            ReferenceId = purchaseInvoice.Id,
            Notes = $"Purchase Invoice: {purchaseInvoice.InvoiceNumber}"
        };

        repo.Add(stockTransaction);
    }

    await repo.Save();

    return Ok(new
    {
        purchaseInvoice.Id,
        purchaseInvoice.InvoiceNumber,
        purchaseInvoice.Total
    });
}
        [HttpDelete("PurchaseInvoices/{id}")]
public async Task<IActionResult> DeletePurchaseInvoice(int id)
{
    var invoice = repo.Get<PurchaseInvoice>(id);

    if (invoice == null)
    {
        return NotFound("Purchase invoice not found.");
    }

    var transactions = repo.GetAll<StockTransaction>()
        .Where(st =>
            st.ReferenceId == invoice.Id &&
            st.Type == StockTransactionType.Purchase &&
            !st.IsDeleted)
        .ToList();

    foreach (var transaction in transactions)
    {
        repo.Add(new StockTransaction
        {
            IngredientId = transaction.IngredientId,

            Quantity = transaction.Quantity,

            Type = StockTransactionType.Adjustment,

            // Keep the reference to the invoice
            ReferenceId = invoice.Id,

            Notes = $"Reversal of purchase invoice {invoice.InvoiceNumber}"
        });
    }

    await repo.SoftDelete<PurchaseInvoice>(id);

    await repo.Save();

    return Ok(new
    {
        Message = "Purchase invoice deleted successfully."
    });
    }
        [HttpPatch("Restore/PurchaseInvoices/{id}")]
        public async Task<IActionResult> RestorePurchaseInvoice(int id)
        {
            await repo.Restore<PurchaseInvoice>(id);
            await repo.Save();
            return Ok(new
            {
                Message = "Purchase invoice restored successfully."
            });
        }   
    }
}
