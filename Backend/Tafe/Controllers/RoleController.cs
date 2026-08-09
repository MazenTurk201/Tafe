using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

// Admin
// Manager
// Cashier
// Waiter
// Kitchen
// Delivery
// Clinet

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin, Manager")]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> role;

        public RoleController(RoleManager<IdentityRole> role)
        {
            this.role = role;
        }
        [HttpPost]
        public async Task<IActionResult> SaveRole(string roleName)
        {
            if (ModelState.IsValid)
            {
                IdentityRole identityRole = new()
                {
                    Name = roleName
                };
                IdentityResult identityResult = await role.CreateAsync(identityRole);
                if (identityResult.Succeeded)
                {
                    return Ok();
                }
                foreach (var error in identityResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }
            return BadRequest(ModelState);
        }
        [HttpGet]
        public IActionResult GetRoles()
        {
            return Ok(role.Roles.ToList().Select(e => new { e.Id, e.Name}));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            IdentityRole targetRole = new()
            {
                Id = id
            };
            await role.DeleteAsync(targetRole);
            return Ok();
        }

    }
}
