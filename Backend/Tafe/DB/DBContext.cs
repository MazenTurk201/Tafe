using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tafe.Models;

namespace Tafe.DB
{
    //public class DBContext : DbContext
    public class DBContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<ProductIngredient> ProductIngredients { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<StockTransaction> StockTransactions { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<CafeTable> CafeTables { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<SalaryPayment> SalaryPayments { get; set; }
        public DbSet<CustomerPoint> CustomerPoints { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<InventoryCount> InventoryCounts { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<EmployeeProfile> EmployeeProfiles { get; set; }
        public DbSet<DeliveryProfile> DeliveryProfiles { get; set; }
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Order>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<OrderItem>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Ingredient>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Category>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Product>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Unit>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Supplier>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<PurchaseInvoice>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<PurchaseInvoiceItem>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<CafeTable>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Reservation>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Attendance>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<SalaryPayment>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<CustomerPoint>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Expense>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<StockTransaction>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Shift>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<Payment>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<InventoryCount>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<ProductIngredient>()
                .HasKey(x => new
                {
                    x.ProductId,
                    x.IngredientId
                });
            modelBuilder.Entity<Order>()
                .HasOne(x => x.Cashier)
                .WithMany(x => x.CashierOrders)
                .HasForeignKey(x => x.CashierId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Order>()
                .HasIndex(x => x.OrderNumber)
                .IsUnique();
            modelBuilder.Entity<Ingredient>()
                .HasIndex(x => x.Name);
            modelBuilder.Entity<Product>()
                .HasIndex(x => x.Name);
            modelBuilder.Entity<Order>()
                .HasIndex(x => x.CustomerId);
            modelBuilder.Entity<Order>()
                .HasIndex(x => x.CashierId);
            modelBuilder.Entity<Order>()
                .HasIndex(x => x.Status);
            modelBuilder.Entity<Order>()
                .HasIndex(x => x.CreatedAt);
            modelBuilder.Entity<ProductIngredient>()
                .HasIndex(x => x.IngredientId);
            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.IngredientId);
            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.CreatedAt);
            modelBuilder.Entity<Payment>()
                .HasIndex(x => x.OrderId);
            modelBuilder.Entity<Payment>()
                .HasIndex(x => x.ShiftId);
            modelBuilder.Entity<Supplier>()
                .HasIndex(x => x.Name)
                .IsUnique();
            modelBuilder.Entity<Product>()
                .HasIndex(x => x.CategoryId);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<EntityTemplate>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}


// db.Products.IgnoreQueryFilters().Where(x => x.IsDeleted)