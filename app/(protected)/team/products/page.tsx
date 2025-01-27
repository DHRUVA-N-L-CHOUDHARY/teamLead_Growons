import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/components/shared/formatPrice";
const Page = async () => {
  // Get the session data
  const session = await auth();

  // Get the team associated with the user
  const team = await db.teamMember.findFirst({
    where: {
      userId: session?.user?.id,
    },
  });

  // Fetch the products associated with the user's team
  const productsData = await db.team.findFirst({
    where: {
      id: team?.teamId,
    },
    select: {
      products: true, // `products` is stored as JSON
    },
  });

  // Safely parse the products into an array
  const products = Array.isArray(productsData?.products)
    ? productsData.products
    : [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Team Products</h1>
      
      {/* Check if products exist */}
      {products?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.name} className="border border-gray-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                <p className="text-gray-600">{`Min: ${product.minProduct} | Max: ${product.maxProduct}`}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(product.price)}</p>
              </div>
              
            
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>No products available for your team.</p>
        </div>
      )}
    </div>
  );
};

export default Page;
