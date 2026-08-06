#nullable disable
using Tafe.Models;

public class Unit : EntityTemplate
{
    public ICollection<Ingredient> Ingredients { get; set; } = [];
}