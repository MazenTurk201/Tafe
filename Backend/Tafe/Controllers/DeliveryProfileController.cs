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
    public class DeliveryProfileController : ControllerBase
    {
        private readonly GenericRepo repo;
        private readonly UserManager<ApplicationUser> userManager;

        public DeliveryProfileController(GenericRepo repo, UserManager<ApplicationUser> userManager)
        {
            this.repo = repo;
            this.userManager = userManager;
        }
        [HttpGet]
        public IActionResult GetDeliveryProfiles()
        {
            var DeliveryProfiles = repo.GetAll<DeliveryProfile>().Where(e => !e.User.IsDeleted);

            return Ok(DeliveryProfiles.Select(e => new DeliveryProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Vehicle = e.Vehicle,
                DeliveryFees = e.DeliveryFees
            }));
        }
        [HttpGet("{userId}")]
        public IActionResult GetDeliveryProfileById(string userId)
        {
            var DeliveryProfile = repo.GetP<DeliveryProfile>(userId);

            if (DeliveryProfile == null || DeliveryProfile.User.IsDeleted)
            {
                return NotFound();
            }

            var DeliveryProfileDTO = new DeliveryProfileDTO
            {
                UserId = DeliveryProfile.UserId,
                UserName = DeliveryProfile.User.UserName,
                FullName = DeliveryProfile.User.FullName,
                Email = DeliveryProfile.User.Email,
                Vehicle = DeliveryProfile.Vehicle,
                DeliveryFees = DeliveryProfile.DeliveryFees
            };

            return Ok(DeliveryProfileDTO);
        }
        [HttpGet("Search/{searchTerm}")]
        public IActionResult SearchDeliveryProfiles(string searchTerm)
        {
            var DeliveryProfiles = repo.GetAll<DeliveryProfile>()
                .Where(e => !e.User.IsDeleted &&
                            (e.User.UserName!.Contains(searchTerm) ||
                             e.User.FirstName.Contains(searchTerm) ||
                             e.User.LastName.Contains(searchTerm)));

            return Ok(DeliveryProfiles.Select(e => new DeliveryProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Vehicle = e.Vehicle,
                DeliveryFees = e.DeliveryFees
            }));
        }
        [HttpPost]
        public async Task<IActionResult> CreateDeliveryProfile(DeliveryCreateDTO DeliveryCreateDTO)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser appUser = new ApplicationUser
                {
                    UserName = DeliveryCreateDTO.User.UserName,
                    Email = DeliveryCreateDTO.User.Email,
                    FirstName = DeliveryCreateDTO.User.FirstName,
                    LastName = DeliveryCreateDTO.User.LastName,
                    CreatedAt = DateTime.UtcNow
                };
                var result = await userManager.CreateAsync(appUser, DeliveryCreateDTO.User.Password);

                if (!result.Succeeded) { return BadRequest(result.Errors); }
                repo.Add(new DeliveryProfile { UserId = appUser.Id, Vehicle = DeliveryCreateDTO.Vehicle , DeliveryFees = DeliveryCreateDTO.DeliveryFees, User = appUser });
                await userManager.AddToRoleAsync(appUser, "Delivery");
                await repo.Save();
                return CreatedAtAction(nameof(GetDeliveryProfiles), new { id = appUser.Id }, null);
            }
            return BadRequest(ModelState);
        }
        [HttpPatch]
        public async Task<IActionResult> UpdateDeliveryProfile(DeliveryProfileUpdateDTO DeliveryProfileUpdateDTO)
        {
            DeliveryProfile? profile = repo.GetP<DeliveryProfile>(DeliveryProfileUpdateDTO.UserId);
            if (profile != null)
            {
                profile.Vehicle = DeliveryProfileUpdateDTO.Vehicle;
                profile.DeliveryFees = DeliveryProfileUpdateDTO.DeliveryFees;
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
        public IActionResult GetDeletedDeliveryProfiles()
        {
            var DeliveryProfiles = repo.GetAll<DeliveryProfile>().Where(e => e.User.IsDeleted);

            return Ok(DeliveryProfiles.Select(e => new DeliveryProfileDTO
            {
                UserId = e.UserId,
                UserName = e.User.UserName,
                FullName = e.User.FullName,
                Email = e.User.Email,
                Vehicle = e.Vehicle,
                DeliveryFees = e.DeliveryFees
            }));
        }
        [HttpDelete("{userName}")]
        public async Task<IActionResult> DeleteDeliveryProfile(string userName)
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
        public async Task<IActionResult> RestoreDeliveryProfile(string userName)
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
