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

        base.OnModelCreating(modelBuilder);
    }
}
