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
                    }));
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
    }
}
