using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tafe.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIngredientQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Ingredients"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
