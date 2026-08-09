using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tafe.Migrations
{
    /// <inheritdoc />
    public partial class AttendancetoStringFromInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeUserId",
                table: "Attendances");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_EmployeeUserId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "EmployeeUserId",
                table: "Attendances");

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeProfileId",
                table: "Attendances",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CheckOut",
                table: "Attendances",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EmployeeProfileId",
                table: "Attendances",
                column: "EmployeeProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeProfileId",
                table: "Attendances",
                column: "EmployeeProfileId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeProfileId",
                table: "Attendances");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_EmployeeProfileId",
                table: "Attendances");

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeProfileId",
                table: "Attendances",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CheckOut",
                table: "Attendances",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmployeeUserId",
                table: "Attendances",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EmployeeUserId",
                table: "Attendances",
                column: "EmployeeUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_EmployeeProfiles_EmployeeUserId",
                table: "Attendances",
                column: "EmployeeUserId",
                principalTable: "EmployeeProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
