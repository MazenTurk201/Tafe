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
    [Authorize(Roles = "Admin, MANAGER")]
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
                IdentityRole identityRole = new();
                identityRole.Name = roleName;
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
        public async Task<IActionResult> GetRoles()
        {
            return Ok(role.Roles.ToList().Select(e => new { Id=e.Id, Name=e.Name}));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            IdentityRole targetRole = new();
            targetRole.Id = id;
            await role.DeleteAsync(targetRole);
            return Ok();
        }

    }
}
