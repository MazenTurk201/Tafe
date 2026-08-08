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
        public void Update<T>(T obj) where T : class
        {
            T? targetEntity;

            int id = (int)db.Entry(obj).Properties.First().CurrentValue!;

            targetEntity = db.Set<T>().Find(id);
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

        public void Delete<T>(int id) where T : class, IEntityTemplate => db.Set<T>().Where(obj => obj.Id == id).ExecuteDelete();
        public async Task SoftDelete<T>(int id) where T : class, IEntityTemplate => await db.Set<T>().Where(obj => obj.Id == id).ExecuteUpdateAsync(set => set.SetProperty(e => e.IsDeleted, true));
        public async Task Restore<T>(int id) where T : class, IEntityTemplate => await db.Set<T>().IgnoreQueryFilters().Where(obj => obj.Id == id).ExecuteUpdateAsync(set => set.SetProperty(e => e.IsDeleted, false));
        public void Save() => db.SaveChanges();
        public T? Get<T>(int id) where T : class, IEntityTemplate => Query<T>().FirstOrDefault(obj => obj.Id == id);
        public T? Get<T>(string Name) where T : class, IEntityTemplate => Query<T>().FirstOrDefault(obj => obj.Name == Name);
        public T? GetP<T>(string UserId) where T : class, IProfileTemplate => Query<T>().FirstOrDefault(obj => obj.UserId == UserId);
        public List<T> GetAll<T>() where T : class => Query<T>().ToList();
        public List<T> GetAllDeleted<T>() where T : class, IEntityTemplate => Query<T>().IgnoreQueryFilters().Where(obj => obj.IsDeleted).ToList();
        public List<T> Search<T>(string Name) where T : class, IEntityTemplate => Query<T>().Where(obj => obj.Name.Contains(Name)).ToList();

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
                return (IQueryable<T>)db.Categories.AsNoTracking().Include(p=>p.Products);
            }
            else if (typeof(T) == typeof(Ingredient))
            {
                return (IQueryable<T>)db.Ingredients.AsNoTracking().Include(u=>u.Unit);
            }
            else if (typeof(T) == typeof(Product))
            {
                return (IQueryable<T>)db.Products.AsNoTracking().Include(c=>c.Category).Include(i=>i.Ingredients);
            }
            else
            {
                return db.Set<T>().AsNoTracking();
            }
        }
    }
}
