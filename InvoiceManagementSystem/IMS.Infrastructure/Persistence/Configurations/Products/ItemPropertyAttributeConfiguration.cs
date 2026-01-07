using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations.Products
{
    public class ItemPropertyAttributeConfiguration : IEntityTypeConfiguration<ItemPropertyAttribute>
    {
        public void Configure(EntityTypeBuilder<ItemPropertyAttribute> builder)
        {
            builder.HasKey(x => x.Id);

            // Foreign keys
            builder.HasOne(x => x.Item)
                .WithMany(x => x.PropertyAttributes)
                .HasForeignKey(x => x.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.PropertyAttribute)
                .WithMany(x => x.ItemPropertyAttributes)
                .HasForeignKey(x => x.PropertyAttributeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Constraints
            builder.HasAlternateKey(x => new { x.ItemId, x.PropertyAttributeId })
                .HasName("UK_ItemPropertyAttribute_ItemId_PropertyAttributeId");

            // Indexes
            builder.HasIndex(x => x.ItemId)
                .HasDatabaseName("IX_ItemPropertyAttribute_ItemId");

            builder.HasIndex(x => x.PropertyAttributeId)
                .HasDatabaseName("IX_ItemPropertyAttribute_PropertyAttributeId");

            builder.HasIndex(x => new { x.ItemId, x.DisplayOrder })
                .HasDatabaseName("IX_ItemPropertyAttribute_ItemId_DisplayOrder");

            // Properties
            builder.Property(x => x.Notes)
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);
        }
    }
}
