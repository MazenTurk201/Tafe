using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerPointsController : ControllerBase
    {
        private readonly GenericRepo repo;

        public CustomerPointsController(GenericRepo repo)
        {
            this.repo = repo;
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost("Add")]
        public async Task<IActionResult> AddingCustomerPoint(string Username, int Points, string Reason)
        {
            if (ModelState.IsValid)
            {
                var user = repo.GetAll<ApplicationUser>().FirstOrDefault(u => u.UserName == Username);
                if (user == null)
                {
                    return NotFound("User not found!!");
                }
                var customerProfile = repo.GetP<CustomerProfile>(user.Id);
                if (customerProfile == null)
                {
                    return NotFound("Customer profile not found!!");
                }
                customerProfile.Points += Points;
                repo.Add(new CustomerPoint { Name = DateTime.UtcNow.ToString("yyyyMMddHHmmss"), IsAddition = true, Points = Points, CustomerId = user.Id, Reason = Reason });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpPost("Deduct")]
        public async Task<IActionResult> DeductingCustomerPoint(string Username, int Points, string Reason)
        {
            if (ModelState.IsValid)
            {
                var user = repo.GetAll<ApplicationUser>().FirstOrDefault(u => u.UserName == Username);
                if (user == null)
                {
                    return NotFound("User not found!!");
                }
                var customerProfile = repo.GetP<CustomerProfile>(user.Id);
                if (customerProfile == null)
                {
                    return NotFound("Customer profile not found!!");
                }
                customerProfile.Points -= Points;
                repo.Add(new CustomerPoint { Name = DateTime.UtcNow.ToString("yyyyMMddHHmmss"), IsAddition = false, Points = Points, CustomerId = user.Id, Reason = Reason });
                await repo.Save();
                return Ok();
            }
            return BadRequest(ModelState);
        }
    }
}
