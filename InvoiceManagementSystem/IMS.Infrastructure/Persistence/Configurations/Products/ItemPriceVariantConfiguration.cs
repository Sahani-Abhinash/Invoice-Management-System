using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations.Products
{
    public class ItemPriceVariantConfiguration : IEntityTypeConfiguration<ItemPriceVariant>
    {
        public void Configure(EntityTypeBuilder<ItemPriceVariant> builder)
        {
            builder.HasKey(x => x.Id);

            // Foreign Keys
            builder.HasOne(x => x.ItemPrice)
                .WithMany(x => x.Variants)
                .HasForeignKey(x => x.ItemPriceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.PropertyAttribute)
                .WithMany(x => x.ItemPriceVariants)
                .HasForeignKey(x => x.PropertyAttributeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for better query performance
            builder.HasIndex(x => x.ItemPriceId)
                .HasDatabaseName("IX_ItemPriceVariant_ItemPriceId");

            builder.HasIndex(x => x.PropertyAttributeId)
                .HasDatabaseName("IX_ItemPriceVariant_PropertyAttributeId");

            // Properties
            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.Property(x => x.StockQuantity)
                .IsRequired(false);

            builder.Property(x => x.VariantSKU)
                .HasMaxLength(100)
                .IsRequired(false);

            // Table name
            builder.ToTable("ItemPriceVariants");
        }
    }
}
