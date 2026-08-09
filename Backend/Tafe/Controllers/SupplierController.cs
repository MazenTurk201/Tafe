using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin, MANAGER")]
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
        public IActionResult CreateSupplier(SupplierCreateDTO supplier)
        {
            if (ModelState.IsValid)
            {
                repo.Add(new Supplier { Name = supplier.Name, Email = supplier.Email, Phone = supplier.Phone, Address = supplier.Address });
                repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            await repo.SoftDelete<Supplier>(id);
            repo.Save();
            return Ok();
        }
        [HttpPatch]
        public IActionResult PatchSupplier(SupplierDTO supplier)
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
            repo.Update(Supplierr);
            repo.Save();

            return Ok();
        }
        [HttpPatch("Restore")]
        public async Task<IActionResult> RestoreSupplier(int id)
        {
            var Supplier = repo.Get<Supplier>(id);

            await repo.Restore<Supplier>(id);
            repo.Save();

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
        public IActionResult CreatePurchaseInvoice(PurchaseInvoiceDTO purchaseInvoiceDTO)
        {
            var supplier = repo.Get<Supplier>(purchaseInvoiceDTO.SupplierId);
            if (supplier == null)
            {
                return NotFound();
            }

            if (purchaseInvoiceDTO.Items == null || purchaseInvoiceDTO.Items.Count == 0)
            { 
                return BadRequest("Invoice must contain at least one item.");
            }

            var purchaseInvoice = new PurchaseInvoice
            {
                InvoiceNumber = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                SupplierId = purchaseInvoiceDTO.SupplierId,
                Total = purchaseInvoiceDTO.Total,
                Items = [.. purchaseInvoiceDTO.Items.Select(i => new PurchaseInvoiceItem
                {
                    IngredientId = i.IngredientId,
                    Quantity = i.Quantity,
                    UnitPrice = i.Price,
                    Total = i.Quantity * i.Price
                })]
            };

            foreach (var item in purchaseInvoice.Items) 
            { 
                var ingredient = repo.Get<Ingredient>(item.IngredientId);
                if (ingredient == null) 
                { 
                    return NotFound( $"Ingredient with ID {item.IngredientId} not found." );
                }
            }

            repo.Add(purchaseInvoice);

            foreach (var item in purchaseInvoice.Items)
            {
                StockTransaction stockTransaction = new()
                {
                    IngredientId = item.IngredientId,
                    Quantity = item.Quantity,
                    Type = StockTransactionType.Purchase,
                };
                repo.Add(stockTransaction);
            }
            
            repo.Save();
            return Ok();
        }
    }
}
