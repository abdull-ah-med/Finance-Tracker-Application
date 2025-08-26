using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;


public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{


    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<TransactionCategory> TransactionCategories { get; set; }
    public DbSet<AccountCategory> AccountCategories { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true); 
        // User constraints
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.FullName).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.Email).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.HashedPassword).IsRequired();

        // Account constraints
        modelBuilder.Entity<Account>().HasIndex(a => a.Name).IsUnique();
        modelBuilder.Entity<Account>().Property(a => a.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Account>().Property(a => a.Balance).IsRequired().HasColumnType("decimal(18,2)");

        // Transaction constraints
        modelBuilder.Entity<Transaction>().Property(t => t.Amount).IsRequired().HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Transaction>().Property(t => t.TransactionDateTime).IsRequired();
        modelBuilder.Entity<Transaction>().Property(t => t.Description).HasMaxLength(500);

        // Category constraints
        modelBuilder.Entity<TransactionCategory>().Property(c => c.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<AccountCategory>().Property(c => c.Name).IsRequired().HasMaxLength(100);

        // Relationships
        modelBuilder.Entity<User>()
            .HasMany(u => u.Accounts)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Account>()
            .HasMany(a => a.Transactions)
            .WithOne(t => t.Account)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TransactionCategory>()
            .HasMany<Transaction>()
            .WithOne(t => t.TransactionCategory)
            .HasForeignKey(t => t.TransactionCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AccountCategory>()
            .HasMany<Account>()
            .WithOne(t => t.AccountCategory)
            .HasForeignKey(t => t.AccountCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data for categories
        modelBuilder.Entity<AccountCategory>().HasData(
            new AccountCategory { Id = 1, Name = "Checking" },
            new AccountCategory { Id = 2, Name = "Savings" },
            new AccountCategory { Id = 3, Name = "Credit Card" },
            new AccountCategory { Id = 4, Name = "Investment" },
            new AccountCategory { Id = 5, Name = "Cash" }
        );

        modelBuilder.Entity<TransactionCategory>().HasData(
            new TransactionCategory { Id = 1, Name = "Income" },
            new TransactionCategory { Id = 2, Name = "Food & Dining" },
            new TransactionCategory { Id = 3, Name = "Transportation" },
            new TransactionCategory { Id = 4, Name = "Shopping" },
            new TransactionCategory { Id = 5, Name = "Entertainment" },
            new TransactionCategory { Id = 6, Name = "Bills & Utilities" },
            new TransactionCategory { Id = 7, Name = "Healthcare" },
            new TransactionCategory { Id = 8, Name = "Education" },
            new TransactionCategory { Id = 9, Name = "Investment" },
            new TransactionCategory { Id = 10, Name = "Other" }
        );

        base.OnModelCreating(modelBuilder);
    }
}
