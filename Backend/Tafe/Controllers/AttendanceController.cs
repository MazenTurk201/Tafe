using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tafe.Models;
using Tafe.Repository;

namespace Tafe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController(GenericRepo repo) : ControllerBase
    {
        private readonly GenericRepo repo = repo;

        // =========================================================
        // CHECK IN
        // =========================================================

        [Authorize]
        [HttpPost("CheckIn")]
        public async Task<IActionResult> CheckIn()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var employee = repo.GetAll<EmployeeProfile>()
                .FirstOrDefault(e => e.UserId == userId);

            if (employee == null)
                return NotFound("Employee profile not found.");

            // هل الموظف بالفعل داخل؟
            var activeAttendance = repo.GetAll<Attendance>();

            var alreadyCheckedIn = activeAttendance.Any(a => a.EmployeeProfileId == employee.UserId && a.CheckOut == null);

            if (alreadyCheckedIn)
                return BadRequest("You are already checked in.");

            var attendance = new Attendance
            {
                EmployeeProfileId = employee.UserId,
                CheckIn = DateTime.UtcNow,
                CheckOut = null,
                Notes = null
            };

            repo.Add(attendance);
            await repo.Save();

            return Ok(new
            {
                Message = "Check-in successful.",
                attendance.Id,
                attendance.CheckIn
            });
        }


        // =========================================================
        // CHECK OUT
        // =========================================================

        [Authorize]
        [HttpPost("CheckOut")]
        public async Task<IActionResult> CheckOut()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var attendances = repo.GetAll<Attendance>();

            var attendance = attendances
                .Where(a =>
                    a.Employee?.UserId == userId &&
                    a.CheckOut == null)
                .OrderByDescending(a => a.CheckIn)
                .FirstOrDefault();

            if (attendance == null)
                return BadRequest("You don't have an active attendance.");

            attendance.CheckOut = DateTime.UtcNow;

            await repo.Update(attendance);
            await repo.Save();

            var hours =
                (attendance.CheckOut.Value - attendance.CheckIn).TotalHours;

            return Ok(new
            {
                Message = "Check-out successful.",
                attendance.Id,
                attendance.CheckIn,
                attendance.CheckOut,
                Hours = Math.Round(hours, 2)
            });
        }


        // =========================================================
        // MY ATTENDANCE
        // =========================================================

        [Authorize]
        [HttpGet("My")]
        public async Task<IActionResult> MyAttendance(
            DateTime? From,
            DateTime? To)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var attendances = repo.GetAll<Attendance>();

            var query = attendances
                .Where(a => a.Employee?.UserId == userId);

            if (From.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date >= From.Value.Date);
            }

            if (To.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date <= To.Value.Date);
            }

            var result = query
                .OrderByDescending(a => a.CheckIn)
                .Select(a => new
                {
                    a.Id,

                    Employee = new
                    {
                        a.Employee?.UserId,
                        a.Employee?.User.UserName,
                        a.Employee?.User.FullName
                    },

                    a.CheckIn,
                    a.CheckOut,

                    Hours = a.CheckOut.HasValue
                        ? Math.Round(
                            (a.CheckOut.Value - a.CheckIn).TotalHours,
                            2)
                        : 0,

                    IsOpen = !a.CheckOut.HasValue,

                    a.Notes
                });

            return Ok(result);
        }


        // =========================================================
        // ALL ATTENDANCE
        // ADMIN / MANAGER
        // =========================================================

        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("All")]
        public async Task<IActionResult> GetAll(
            DateTime? From,
            DateTime? To,
            string? EmployeeId)
        {
            var attendances = repo.GetAll<Attendance>();

            var query = attendances.AsQueryable();

            // فلترة من تاريخ
            if (From.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date >= From.Value.Date);
            }

            // فلترة إلى تاريخ
            if (To.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date <= To.Value.Date);
            }

            // فلترة موظف معين
            if (EmployeeId != null)
            {
                query = query.Where(a => a.EmployeeProfileId == EmployeeId);
            }

            var result = query
                .OrderByDescending(a => a.CheckIn)
                .Select(a => new
                {
                    a.Id,

                    Employee = new
                    {
                        a.Employee!.UserId,
                        a.Employee!.User.UserName,
                        a.Employee!.User.FullName
                    },

                    a.CheckIn.Date,

                    a.CheckIn,
                    a.CheckOut,

                    Hours = a.CheckOut.HasValue
                        ? Math.Round(
                            (a.CheckOut.Value - a.CheckIn).TotalHours,
                            2)
                        : 0,

                    IsOpen = !a.CheckOut.HasValue,

                    a.Notes
                })
                .ToList();

            return Ok(result);
        }


        // =========================================================
        // ATTENDANCE SUMMARY
        // TOTAL HOURS PER EMPLOYEE
        // =========================================================

        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Summary")]
        public async Task<IActionResult> Summary(
            DateTime? From,
            DateTime? To)
        {
            var attendances = repo.GetAll<Attendance>();

            var query = attendances.AsQueryable();

            if (From.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date >= From.Value.Date);
            }

            if (To.HasValue)
            {
                query = query.Where(a =>
                    a.CheckIn.Date <= To.Value.Date);
            }

            var result = query
                .GroupBy(a => new
                {
                    a.EmployeeProfileId,
                    a.Employee!.User.UserName,
                    a.Employee.User.FullName
                })
                .Select(g => new
                {
                    EmployeeId = g.Key.EmployeeProfileId,

                    g.Key.UserName,

                    g.Key.FullName,

                    Days = g.Count(),

                    TotalHours = Math.Round(
                        g.Sum(a =>
                            a.CheckOut.HasValue
                                ? (a.CheckOut.Value - a.CheckIn).TotalHours
                                : 0),
                        2),

                    OpenAttendance = g.Count(a =>
                        a.CheckOut == null)
                })
                .OrderBy(x => x.FullName)
                .ToList();

            return Ok(result);
        }


        // =========================================================
        // TODAY
        // =========================================================

        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("Today")]
        public async Task<IActionResult> Today()
        {
            var today = DateTime.UtcNow.Date;

            var attendances = repo.GetAll<Attendance>();

            var result = attendances
                .Where(a => a.CheckIn.Date == today)
                .OrderByDescending(a => a.CheckIn)
                .Select(a => new
                {
                    a.Id,

                    Employee = new
                    {
                        a.Employee!.UserId,
                        a.Employee!.User.UserName,
                        a.Employee!.User.FullName
                    },

                    a.CheckIn,
                    a.CheckOut,

                    Hours = a.CheckOut.HasValue
                        ? Math.Round(
                            (a.CheckOut.Value - a.CheckIn).TotalHours,
                            2)
                        : 0,

                    IsOpen = !a.CheckOut.HasValue
                })
                .ToList();

            return Ok(result);
        }
    }
}