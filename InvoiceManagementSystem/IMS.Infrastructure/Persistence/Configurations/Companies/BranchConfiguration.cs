using IMS.Domain.Entities.Company;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence.Configurations.Companies
{
    public class BranchConfiguration : IEntityTypeConfiguration<Branch>
    {
        public void Configure(EntityTypeBuilder<Branch> builder)
        {
            //builder.ToTable("Branches");
            //builder.HasKey(b => b.Id);

            //builder.Property(b => b.Name).IsRequired().HasMaxLength(200);
            //builder.Property(b => b.Address).HasMaxLength(500);

            //builder.HasOne(b => b.Company)
            //       .WithMany(c => c.Branches)
            //       .HasForeignKey(b => b.CompanyId);

            // Seed branches
            //builder.HasData(
            //    new Branch
            //    {
            //        Id = Guid.Parse("aaaaaaa1-aaaa-" +
            //        "aaaa-aaaa-aaaaaaaaaaa1"),
            //        CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            //        Name = "ABC Delhi Branch",
            //        Address = "Delhi, India"
            //    },
            //    new Branch
            //    {
            //        Id = Guid.Parse("aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
            //        CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            //        Name = "XYZ Berlin Branch",
            //        Address = "Berlin, Germany"
            //    }
            //);
        }
    }
}