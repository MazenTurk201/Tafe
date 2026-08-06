#nullable disable
namespace Tafe.Models
{
    public abstract class EntityTemplate : IEntityTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; }

        public EntityTemplate()
        {
            IsDeleted = false;
            CreatedAt = DateTime.UtcNow;
        }
    }

    public interface IEntityTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
    }

    public interface IProfileTemplate
    {
        public string UserId { get; set; }
    }
}
