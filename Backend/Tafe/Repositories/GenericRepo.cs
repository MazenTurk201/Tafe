using Microsoft.EntityFrameworkCore;
using Tafe.DB;
using Tafe.Models;

namespace Tafe.Repository
{
    public class GenericRepo
    {
        private readonly DBContext db;
        public GenericRepo(DBContext db) => this.db = db;
        public void Add<T>(T obj) where T : class => db.Add(obj);
        public async Task Update<T>(T obj) where T : class
        {
            T? targetEntity;

            int id = (int)db.Entry(obj).Properties.First().CurrentValue!;

            targetEntity = await db.Set<T>().FindAsync(id);
            if (targetEntity != null)
            {
                foreach (var prop in typeof(T).GetProperties())
                {
                    if (prop.GetValue(obj) != null)
                    {
                        prop.SetValue(targetEntity, prop.GetValue(obj));
                    }
                }
            }
            else
            {
                throw new Exception("Target not Found");
            }

        }

        public async Task Delete<T>(int id) where T : class, IEntityTemplate => await db.Set<T>().Where(obj => obj.Id == id).ExecuteDeleteAsync();
        public void Delete<T>(T obj) where T : class => db.Remove(obj);
        public async Task SoftDelete<T>(int id) where T : class, IEntityTemplate => await db.Set<T>().Where(obj => obj.Id == id).ExecuteUpdateAsync(set => set.SetProperty(e => e.IsDeleted, true));
        public async Task Restore<T>(int id) where T : class, IEntityTemplate => await db.Set<T>().IgnoreQueryFilters().Where(obj => obj.Id == id).ExecuteUpdateAsync(set => set.SetProperty(e => e.IsDeleted, false));
        public async Task Save() => await db.SaveChangesAsync();
        public  T? Get<T>(int id) where T : class, IEntityTemplate => Query<T>().FirstOrDefault(obj => obj.Id == id);
        public  T? Get<T>(string Name) where T : class, IEntityTemplate => Query<T>().FirstOrDefault(obj => obj.Name == Name);
        public  T? GetP<T>(string UserId) where T : class, IProfileTemplate => Query<T>().FirstOrDefault(obj => obj.UserId == UserId);
        public  List<T> GetAll<T>() where T : class => Query<T>().ToList();
        public  List<T> GetAllDeleted<T>() where T : class, IEntityTemplate => Query<T>().IgnoreQueryFilters().Where(obj => obj.IsDeleted).ToList();
        public  List<T> Search<T>(string Name) where T : class, IEntityTemplate => Query<T>().Where(obj => obj.Name.Contains(Name)).ToList();

        private IQueryable<T> Query<T>() where T : class
        {
            if (typeof(T) == typeof(Unit))
            {
                return (IQueryable<T>)db.Units.AsNoTracking().Include(e => e.Ingredients);
            }
            else if (typeof(T) == typeof(EmployeeProfile))
            {
                return (IQueryable<T>)db.EmployeeProfiles.AsNoTracking().Include(e => e.User);
            }
            else if (typeof(T) == typeof(DeliveryProfile))
            {
                return (IQueryable<T>)db.DeliveryProfiles.AsNoTracking().Include(e => e.User);
            }
            else if (typeof(T) == typeof(CustomerProfile))
            {
                return (IQueryable<T>)db.CustomerProfiles.AsNoTracking().Include(e => e.User);
            }
            else if (typeof(T) == typeof(Category))
            {
                return (IQueryable<T>)db.Categories.AsNoTracking().Include(p=>p.Products).ThenInclude(i=>i.Ingredients).ThenInclude(i=>i.Ingredient).ThenInclude(u=>u.Unit);
            }
            else if (typeof(T) == typeof(Ingredient))
            {
                return (IQueryable<T>)db.Ingredients.AsNoTracking().Include(u=>u.Unit).Include(st=>st.StockTransactions);
            }
            else if (typeof(T) == typeof(Product))
            {
                return (IQueryable<T>)db.Products.AsNoTracking().Include(c=>c.Category).Include(i=>i.Ingredients).ThenInclude(pi=>pi.Ingredient).ThenInclude(u=>u.Unit);
            }
            else if (typeof(T) == typeof(PurchaseInvoice))
            {
                return (IQueryable<T>)db.PurchaseInvoices.AsNoTracking().Include(s => s.Supplier).Include(i => i.Items).ThenInclude(pi => pi.Ingredient).ThenInclude(u => u.Unit);
            }
            else if (typeof(T) == typeof(Supplier))
            {
                return (IQueryable<T>)db.Suppliers.AsNoTracking().Include(pi => pi.PurchaseInvoices).ThenInclude(i => i.Items).ThenInclude(pi => pi.Ingredient).ThenInclude(u => u.Unit);
            }
            else if (typeof(T) == typeof(StockTransaction))
            {
                return (IQueryable<T>)db.StockTransactions.AsNoTracking().Include(i => i.Ingredient).ThenInclude(u => u.Unit);
            }
            else if (typeof(T) == typeof(InventoryCount))
            {
                return (IQueryable<T>)db.InventoryCounts.AsNoTracking().Include(i => i.Ingredient).ThenInclude(u => u.Unit);
            }
            else if (typeof(T) == typeof(CafeTable))
            {
                return (IQueryable<T>)db.CafeTables.AsNoTracking().Include(o => o.Orders).Include(r => r.Reservations);
            }
            else if (typeof(T) == typeof(Reservation))
            {
                return (IQueryable<T>)db.Reservations.AsNoTracking().Include(c => c.Customer).ThenInclude(u => u.User);
            }
            else if (typeof(T) == typeof(Shift))
            {
                return (IQueryable<T>)db.Shifts.AsNoTracking().Include(u => u.User);
            }
            else if (typeof(T) == typeof(Payment))
            {
                return (IQueryable<T>)db.Payments.AsNoTracking().Include(o => o.Order).ThenInclude(c => c.Customer).ThenInclude(u => u!.User);
            }
            else if (typeof(T) == typeof(SalaryPayment))
            {
                return (IQueryable<T>)db.SalaryPayments.AsNoTracking().Include(e => e.Employee).ThenInclude(u => u!.User);
            }
            else if (typeof(T) == typeof(Order))
            {
                return (IQueryable<T>)db.Orders.AsNoTracking()
                    .Include(o => o.Items).ThenInclude(i => i.Product)
                    .Include(o => o.Customer).ThenInclude(c => c!.User)
                    .Include(o => o.Cashier)
                    .Include(o => o.Table);
            }
            else
            {
                return db.Set<T>().AsNoTracking();
            }
        }
    }
}
