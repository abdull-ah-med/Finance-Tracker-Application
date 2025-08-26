using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedCategoriesData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AccountCategories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Checking" },
                    { 2, "Savings" },
                    { 3, "Credit Card" },
                    { 4, "Investment" },
                    { 5, "Cash" }
                });

            migrationBuilder.InsertData(
                table: "TransactionCategories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Income" },
                    { 2, "Food & Dining" },
                    { 3, "Transportation" },
                    { 4, "Shopping" },
                    { 5, "Entertainment" },
                    { 6, "Bills & Utilities" },
                    { 7, "Healthcare" },
                    { 8, "Education" },
                    { 9, "Investment" },
                    { 10, "Other" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AccountCategories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "AccountCategories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "AccountCategories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "AccountCategories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "AccountCategories",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 10);
        }
    }
}
