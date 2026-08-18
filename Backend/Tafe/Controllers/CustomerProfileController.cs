using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Tafe.DTOs;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Authorize(Roles = "Admin, Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerProfileController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly UserManager<ApplicationUser> userManager;

        public CustomerProfileController(GenericRepo repo, UserManager<ApplicationUser> userManager)
        {
            this.repo = repo;
            this.userManager = userManager;
        }
        [HttpGet]
        public IActionResult GetCustomerProfiles()
        {
            var CustomerProfiles = repo.GetAll<CustomerProfile>().Where(e => !e.User.IsDeleted);

            return Ok(CustomerProfiles.Select(e => new CustomerProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Points = e.Points,
                TotalSpent = e.TotalSpent,
                Vip = e.Vip,
                BirthDate = e.BirthDate
            }));
        }
        [HttpGet("{userId}")]
        public IActionResult GetCustomerProfileById(string userId)
        {
            var CustomerProfile = repo.GetP<CustomerProfile>(userId);

            if (CustomerProfile == null || CustomerProfile.User.IsDeleted)
            {
                return NotFound();
            }

            var CustomerProfileDTO = new CustomerProfileDTO
            {
                UserId = CustomerProfile.UserId,
                UserName = CustomerProfile.User.UserName,
                FullName = CustomerProfile.User.FullName,
                Email = CustomerProfile.User.Email,
                Points = CustomerProfile.Points,
                TotalSpent = CustomerProfile.TotalSpent,
                Vip = CustomerProfile.Vip,
                BirthDate = CustomerProfile.BirthDate
            };

            return Ok(CustomerProfileDTO);
        }
        [HttpGet("Profile")]
        public IActionResult GetCustomerProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var CustomerProfile = repo.GetP<CustomerProfile>(userId);

            if (CustomerProfile == null || CustomerProfile.User.IsDeleted)
            {
                return NotFound();
            }

            var CustomerProfileDTO = new CustomerProfileDTO
            {
                UserId = CustomerProfile.UserId,
                UserName = CustomerProfile.User.UserName,
                FullName = CustomerProfile.User.FullName,
                Email = CustomerProfile.User.Email,
                Points = CustomerProfile.Points,
                TotalSpent = CustomerProfile.TotalSpent,
                Vip = CustomerProfile.Vip,
                BirthDate = CustomerProfile.BirthDate,
                Address = CustomerProfile.Address
            };

            return Ok(CustomerProfileDTO);
        }
        [HttpGet("Search/{searchTerm}")]
        public IActionResult SearchCustomerProfiles(string searchTerm)
        {
            var CustomerProfiles = repo.GetAll<CustomerProfile>()
                .Where(e => !e.User.IsDeleted &&
                            (e.User.UserName!.Contains(searchTerm) ||
                             e.User.FirstName.Contains(searchTerm) ||
                             e.User.LastName.Contains(searchTerm)));

            return Ok(CustomerProfiles.Select(e => new CustomerProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Points = e.Points,
                TotalSpent = e.TotalSpent,
                Vip = e.Vip,
                BirthDate = e.BirthDate,
                Address = e.Address
            }));
        }
        [HttpPost]
        public async Task<IActionResult> CreateCustomerProfile(CustomerCreateDTO CustomerCreateDTO)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser appUser = new ApplicationUser
                {
                    UserName = CustomerCreateDTO.User.UserName,
                    Email = CustomerCreateDTO.User.Email,
                    FirstName = CustomerCreateDTO.User.FirstName,
                    LastName = CustomerCreateDTO.User.LastName,
                    CreatedAt = DateTime.UtcNow
                };
                var result = await userManager.CreateAsync(appUser, CustomerCreateDTO.User.Password);

                if (!result.Succeeded) { return BadRequest(result.Errors); }
                repo.Add(new CustomerProfile {
                    UserId = appUser.Id,
                    Vip = CustomerCreateDTO.Vip,
                    TotalSpent = 0,
                    BirthDate = CustomerCreateDTO.BirthDate,
                    User = appUser,
                    Address = CustomerCreateDTO.Address
                    });
                await userManager.AddToRoleAsync(appUser, "Clinet");
                await repo.Save();
                return CreatedAtAction(nameof(GetCustomerProfiles), new { id = appUser.Id }, null);
            }
            return BadRequest(ModelState);
        }
        [HttpPatch]
        public async Task<IActionResult> UpdateCustomerProfile(CustomerProfileUpdateDTO CustomerProfileUpdateDTO)
        {
            CustomerProfile? profile = repo.GetP<CustomerProfile>(CustomerProfileUpdateDTO.UserId);
            if (profile != null)
            {
                profile.Points = CustomerProfileUpdateDTO.Points;
                profile.TotalSpent = CustomerProfileUpdateDTO.TotalSpent;
                profile.Vip = CustomerProfileUpdateDTO.Vip;
                profile.BirthDate = CustomerProfileUpdateDTO.BirthDate;
                profile.Address = CustomerProfileUpdateDTO.Address;
                await repo.Update(profile);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
        [HttpGet("Deleted")]
        public IActionResult GetDeletedCustomerProfiles()
        {
            var CustomerProfiles = repo.GetAll<CustomerProfile>().Where(e => e.User.IsDeleted);

            return Ok(CustomerProfiles.Select(e => new CustomerProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Points = e.Points,
                TotalSpent = e.TotalSpent,
                Vip = e.Vip,
                BirthDate = e.BirthDate,
                Address = e.Address
            }));
        }
        [HttpDelete("{userName}")]
        public async Task<IActionResult> DeleteCustomerProfile(string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null)
            {
                user.IsDeleted = true;
                await userManager.UpdateAsync(user);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
        [HttpPatch("Restore/{userName}")]
        public async Task<IActionResult> RestoreCustomerProfile(string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null)
            {
                user.IsDeleted = false;
                await userManager.UpdateAsync(user);
                await repo.Save();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
