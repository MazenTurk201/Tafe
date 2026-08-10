using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tafe.Migrations
{
    /// <inheritdoc />
    public partial class SalaryPaymenttoStringFromInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeUserId",
                table: "SalaryPayments");

            migrationBuilder.DropIndex(
                name: "IX_SalaryPayments_EmployeeUserId",
                table: "SalaryPayments");

            migrationBuilder.DropColumn(
                name: "EmployeeUserId",
                table: "SalaryPayments");

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeProfileId",
                table: "SalaryPayments",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryPayments_EmployeeProfileId",
                table: "SalaryPayments",
                column: "EmployeeProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeProfileId",
                table: "SalaryPayments",
                column: "EmployeeProfileId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeProfileId",
                table: "SalaryPayments");

            migrationBuilder.DropIndex(
                name: "IX_SalaryPayments_EmployeeProfileId",
                table: "SalaryPayments");

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeProfileId",
                table: "SalaryPayments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmployeeUserId",
                table: "SalaryPayments",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalaryPayments_EmployeeUserId",
                table: "SalaryPayments",
                column: "EmployeeUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SalaryPayments_EmployeeProfiles_EmployeeUserId",
                table: "SalaryPayments",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId");
        }
    }
}
