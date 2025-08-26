using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedTransactionService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Transactions",
                newName: "TransactionCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_CategoryId",
                table: "Transactions",
                newName: "IX_Transactions_TransactionCategoryId");

            migrationBuilder.AddColumn<int>(
                name: "AccountCategoryId",
                table: "Accounts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AccountCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransactionCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountCategoryId",
                table: "Accounts",
                column: "AccountCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_Name",
                table: "Accounts",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_AccountCategories_AccountCategoryId",
                table: "Accounts",
                column: "AccountCategoryId",
                principalTable: "AccountCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_TransactionCategories_TransactionCategoryId",
                table: "Transactions",
                column: "TransactionCategoryId",
                principalTable: "TransactionCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_AccountCategories_AccountCategoryId",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_TransactionCategories_TransactionCategoryId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "AccountCategories");

            migrationBuilder.DropTable(
                name: "TransactionCategories");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_AccountCategoryId",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_Name",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "AccountCategoryId",
                table: "Accounts");

            migrationBuilder.RenameColumn(
                name: "TransactionCategoryId",
                table: "Transactions",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_TransactionCategoryId",
                table: "Transactions",
                newName: "IX_Transactions_CategoryId");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
