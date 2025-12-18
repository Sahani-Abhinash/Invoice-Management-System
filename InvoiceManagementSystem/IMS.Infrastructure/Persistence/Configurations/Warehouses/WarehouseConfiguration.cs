using IMS.Domain.Entities.Warehouse;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence.Configurations.Warehouses
{
    public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
    {
        public void Configure(EntityTypeBuilder<Warehouse> builder)
        {
            //builder.ToTable("Warehouses");
            //builder.HasKey(w => w.Id);

            //builder.Property(w => w.Name).IsRequired().HasMaxLength(200);

            //builder.HasOne<IMS.Domain.Entities.Company.Branch>()
            //       .WithMany(b => b.Warehouses)
            //       .HasForeignKey(w => w.BranchId);

            // Seed initial warehouses
            //builder.HasData(
            //    new Warehouse
            //    {
            //        Id = Guid.Parse("wwwwww01-wwww-wwww-wwww-wwwwwwwwww01"),
            //        BranchId = Guid.Parse("aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
            //        Name = "ABC Delhi Main Warehouse"
            //    },
            //    new Warehouse
            //    {
            //        Id = Guid.Parse("wwwwww02-wwww-wwww-wwww-wwwwwwwwww02"),
            //        BranchId = Guid.Parse("aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
            //        Name = "XYZ Berlin Central Warehouse"
            //    }
            //);
        }
    }
}
