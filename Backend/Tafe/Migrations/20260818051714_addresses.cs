using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tafe.Migrations
{
    /// <inheritdoc />
    public partial class addresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "CustomerProfiles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "CustomerProfiles",
                type: "TEXT",
                nullable: true);
        }
    }
}
