using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tafe.Migrations
{
    /// <inheritdoc />
    public partial class addingProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_EmployeeProfile_EmployeeUserId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerPoints_CustomerProfile_CustomerId",
                table: "CustomerPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfile_AspNetUsers_UserId1",
                table: "CustomerProfile");

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeProfile_AspNetUsers_UserId1",
                table: "EmployeeProfile");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_CustomerProfile_CustomerId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_CustomerProfile_CustomerId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_SalaryPayments_EmployeeProfile_EmployeeUserId",
                table: "SalaryPayments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EmployeeProfile",
                table: "EmployeeProfile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomerProfile",
                table: "CustomerProfile");

            migrationBuilder.RenameTable(
                name: "EmployeeProfile",
                newName: "EmployeeProfiles");

            migrationBuilder.RenameTable(
                name: "CustomerProfile",
                newName: "CustomerProfiles");

            migrationBuilder.RenameIndex(
                name: "IX_EmployeeProfile_UserId1",
                table: "EmployeeProfiles",
                newName: "IX_EmployeeProfiles_UserId1");

            migrationBuilder.RenameIndex(
                name: "IX_CustomerProfile_UserId1",
                table: "CustomerProfiles",
                newName: "IX_CustomerProfiles_UserId1");

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeUserId",
                table: "SalaryPayments",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EmployeeProfiles",
                table: "EmployeeProfiles",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomerProfiles",
                table: "CustomerProfiles",
                column: "UserId");

            migrationBuilder.CreateTable(
                name: "DeliveryProfiles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId1 = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Vehicle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryFees = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_DeliveryProfiles_AspNetUsers_UserId1",
                        column: x => x.UserId1,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryProfiles_UserId1",
                table: "DeliveryProfiles",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeUserId",
                table: "Attendances",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerPoints_CustomerProfiles_CustomerId",
                table: "CustomerPoints",
                column: "CustomerId",
                principalTable: "CustomerProfiles",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfiles_AspNetUsers_UserId1",
                table: "CustomerProfiles",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeProfiles_AspNetUsers_UserId1",
                table: "EmployeeProfiles",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_CustomerProfiles_CustomerId",
                table: "Orders",
                column: "CustomerId",
                principalTable: "CustomerProfiles",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_CustomerProfiles_CustomerId",
                table: "Reservations",
                column: "CustomerId",
                principalTable: "CustomerProfiles",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeUserId",
                table: "SalaryPayments",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeUserId",
                table: "Attendances");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerPoints_CustomerProfiles_CustomerId",
                table: "CustomerPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfiles_AspNetUsers_UserId1",
                table: "CustomerProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeProfiles_AspNetUsers_UserId1",
                table: "EmployeeProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_CustomerProfiles_CustomerId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_CustomerProfiles_CustomerId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeUserId",
                table: "SalaryPayments");

            migrationBuilder.DropTable(
                name: "DeliveryProfiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EmployeeProfiles",
                table: "EmployeeProfiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomerProfiles",
                table: "CustomerProfiles");

            migrationBuilder.RenameTable(
                name: "EmployeeProfiles",
                newName: "EmployeeProfile");

            migrationBuilder.RenameTable(
                name: "CustomerProfiles",
                newName: "CustomerProfile");

            migrationBuilder.RenameIndex(
                name: "IX_EmployeeProfiles_UserId1",
                table: "EmployeeProfile",
                newName: "IX_EmployeeProfile_UserId1");

            migrationBuilder.RenameIndex(
                name: "IX_CustomerProfiles_UserId1",
                table: "CustomerProfile",
                newName: "IX_CustomerProfile_UserId1");

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeUserId",
                table: "SalaryPayments",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_EmployeeProfile",
                table: "EmployeeProfile",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomerProfile",
                table: "CustomerProfile",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_EmployeeProfile_EmployeeUserId",
                table: "Attendances",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfile",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerPoints_CustomerProfile_CustomerId",
                table: "CustomerPoints",
                column: "CustomerId",
                principalTable: "CustomerProfile",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfile_AspNetUsers_UserId1",
                table: "CustomerProfile",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeProfile_AspNetUsers_UserId1",
                table: "EmployeeProfile",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_CustomerProfile_CustomerId",
                table: "Orders",
                column: "CustomerId",
                principalTable: "CustomerProfile",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_CustomerProfile_CustomerId",
                table: "Reservations",
                column: "CustomerId",
                principalTable: "CustomerProfile",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SalaryPayments_EmployeeProfile_EmployeeUserId",
                table: "SalaryPayments",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfile",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
