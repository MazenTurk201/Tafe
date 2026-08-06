#nullable disable
namespace Tafe.Models
{
    public class Category : EntityTemplate
    {
        public ICollection<Product> Products { get; set; } = [];
    }
}
