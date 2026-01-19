import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@newsportal.com" },
    update: {},
    create: {
      email: "admin@newsportal.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create categories
  const categories = [
    { name: "Politics", slug: "politics", description: "Political news and updates" },
    { name: "Sports", slug: "sports", description: "Sports news and coverage" },
    { name: "International", slug: "international", description: "World news and global affairs" },
    { name: "Technology", slug: "technology", description: "Tech news and innovations" },
    { name: "Business", slug: "business", description: "Business and finance news" },
    { name: "Entertainment", slug: "entertainment", description: "Entertainment and celebrity news" },
  ];

  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  console.log("Created categories:", createdCategories.map((c) => c.name).join(", "));

  // Create sample articles
  const articles = [
    {
      title: "Government Announces New Economic Policy",
      slug: "government-announces-new-economic-policy",
      summary: "The government unveiled a comprehensive economic reform package aimed at boosting growth and creating jobs.",
      content: `<p>In a major policy announcement today, the government revealed its new economic framework designed to stimulate growth across multiple sectors.</p>
      <p>The package includes tax incentives for small businesses, infrastructure investment plans, and measures to attract foreign investment.</p>
      <p>"This is a pivotal moment for our economy," said the Finance Minister during the press conference. "We are committed to creating an environment where businesses can thrive and citizens can prosper."</p>
      <p>Key highlights of the policy include:</p>
      <ul>
        <li>30% tax reduction for small and medium enterprises</li>
        <li>$10 billion infrastructure development fund</li>
        <li>Simplified regulations for foreign investors</li>
        <li>Job creation programs targeting youth unemployment</li>
      </ul>
      <p>Economic analysts have responded positively to the announcement, with many predicting a boost in market confidence.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200",
      categorySlug: "politics",
      status: "PUBLISHED" as const,
    },
    {
      title: "National Team Wins Historic Championship",
      slug: "national-team-wins-historic-championship",
      summary: "In a thrilling final match, the national football team secured their first international championship in 20 years.",
      content: `<p>History was made last night as the national football team clinched the championship title with a dramatic 3-2 victory.</p>
      <p>The match, watched by millions around the world, saw the team come back from a 2-1 deficit in the second half to claim victory in the final minutes.</p>
      <p>Captain Ahmed scored the winning goal in the 89th minute, sending the entire nation into celebration.</p>
      <p>"This victory belongs to everyone who believed in us," the captain said during the post-match interview. "We've worked so hard for this moment."</p>
      <p>Thousands of fans gathered in the capital to celebrate the historic win, with celebrations continuing into the early hours of the morning.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200",
      categorySlug: "sports",
      status: "PUBLISHED" as const,
    },
    {
      title: "Global Climate Summit Reaches Landmark Agreement",
      slug: "global-climate-summit-reaches-landmark-agreement",
      summary: "World leaders have committed to ambitious new targets to combat climate change at the international summit.",
      content: `<p>After two weeks of intense negotiations, representatives from 195 countries have agreed to a historic climate accord.</p>
      <p>The agreement commits nations to reducing carbon emissions by 50% by 2035 and achieving net-zero emissions by 2050.</p>
      <p>Key provisions of the agreement include:</p>
      <ul>
        <li>Phasing out coal power by 2030 for developed nations</li>
        <li>$100 billion annual fund for developing countries</li>
        <li>Mandatory reporting on emissions and progress</li>
        <li>Protection for vulnerable ecosystems and biodiversity</li>
      </ul>
      <p>Environmental groups have welcomed the agreement while noting that implementation will be crucial.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=1200",
      categorySlug: "international",
      status: "PUBLISHED" as const,
    },
    {
      title: "Revolutionary AI Technology Transforms Healthcare",
      slug: "revolutionary-ai-technology-transforms-healthcare",
      summary: "New artificial intelligence systems are enabling earlier disease detection and personalized treatment plans.",
      content: `<p>A breakthrough in artificial intelligence is revolutionizing how doctors diagnose and treat diseases.</p>
      <p>The new AI system, developed by a consortium of leading tech companies and medical institutions, can analyze medical images with 99% accuracy.</p>
      <p>"We're seeing diseases being detected months or even years earlier than traditional methods allow," said Dr. Sarah Chen, lead researcher on the project.</p>
      <p>The technology has already been deployed in several major hospitals, with remarkable results:</p>
      <ul>
        <li>40% improvement in early cancer detection</li>
        <li>Reduced diagnosis time from weeks to hours</li>
        <li>Personalized treatment recommendations</li>
        <li>Lower healthcare costs through efficiency</li>
      </ul>
      <p>The FDA has approved the system for clinical use, marking a new era in medical technology.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
      categorySlug: "technology",
      status: "PUBLISHED" as const,
    },
    {
      title: "Stock Markets Reach All-Time High",
      slug: "stock-markets-reach-all-time-high",
      summary: "Major indices surged to record levels as investor confidence grows following positive economic data.",
      content: `<p>Global stock markets closed at unprecedented highs today, driven by strong corporate earnings and optimistic economic forecasts.</p>
      <p>The benchmark index gained 2.5% in a single session, its largest daily increase this year.</p>
      <p>Technology and healthcare sectors led the rally, with several major companies reporting better-than-expected quarterly results.</p>
      <p>"We're seeing a perfect storm of positive factors," explained market analyst James Wilson. "Low inflation, strong employment, and robust consumer spending are all contributing."</p>
      <p>However, some analysts caution that valuations are stretched and investors should remain vigilant.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200",
      categorySlug: "business",
      status: "PUBLISHED" as const,
    },
    {
      title: "Award-Winning Film Breaks Box Office Records",
      slug: "award-winning-film-breaks-box-office-records",
      summary: "The critically acclaimed drama has become the highest-grossing film of the year in just two weeks.",
      content: `<p>The latest release from acclaimed director Maria Rodriguez has shattered box office expectations worldwide.</p>
      <p>The film, which explores themes of family and resilience, earned $500 million globally in its opening weekend.</p>
      <p>"We knew we had something special, but this response has exceeded all our expectations," Rodriguez said.</p>
      <p>Critics have praised the film for its powerful storytelling and outstanding performances:</p>
      <ul>
        <li>98% rating on major review aggregators</li>
        <li>Multiple award nominations anticipated</li>
        <li>Praised for diverse casting and authentic representation</li>
        <li>Soundtrack topping music charts globally</li>
      </ul>
      <p>The film is expected to continue its strong performance as it expands to additional markets.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
      categorySlug: "entertainment",
      status: "PUBLISHED" as const,
    },
    {
      title: "New Education Reform Bill Passes Legislature",
      slug: "new-education-reform-bill-passes-legislature",
      summary: "Comprehensive education reforms will increase funding and modernize curriculum across public schools.",
      content: `<p>After months of debate, lawmakers have passed a sweeping education reform bill that promises to transform public schooling.</p>
      <p>The legislation includes significant increases in teacher salaries, technology investments, and curriculum updates.</p>
      <p>"Every child deserves access to quality education," said the Education Minister. "This bill makes that a reality."</p>
      <p>Key provisions include:</p>
      <ul>
        <li>25% increase in education budget</li>
        <li>Modern technology in every classroom</li>
        <li>Updated STEM curriculum</li>
        <li>Mental health support programs</li>
      </ul>
      <p>The reforms will be implemented over the next three years.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
      categorySlug: "politics",
      status: "PUBLISHED" as const,
    },
    {
      title: "Tennis Star Announces Retirement",
      slug: "tennis-star-announces-retirement",
      summary: "After two decades of professional play and numerous Grand Slam titles, the legendary player bids farewell.",
      content: `<p>The tennis world is mourning the retirement of one of its greatest players after an illustrious 20-year career.</p>
      <p>With 23 Grand Slam titles to their name, the player announced the decision at an emotional press conference.</p>
      <p>"Tennis has given me everything. Now it's time to give back in other ways," the champion said.</p>
      <p>Career highlights include:</p>
      <ul>
        <li>23 Grand Slam titles</li>
        <li>310 weeks as world number one</li>
        <li>Olympic gold medalist</li>
        <li>Numerous charity initiatives</li>
      </ul>
      <p>Plans for a farewell tour are in the works, giving fans one last chance to see the legend in action.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200",
      categorySlug: "sports",
      status: "PUBLISHED" as const,
    },
    {
      title: "Space Agency Launches Mars Mission",
      slug: "space-agency-launches-mars-mission",
      summary: "The ambitious mission aims to land the first humans on Mars within the next decade.",
      content: `<p>A new era in space exploration began today with the launch of the most ambitious Mars mission ever attempted.</p>
      <p>The spacecraft, carrying cutting-edge equipment and supplies, is the first step in establishing a human presence on the red planet.</p>
      <p>"This is humanity's greatest adventure," declared the mission director. "We are taking our first steps toward becoming a multi-planetary species."</p>
      <p>The mission includes:</p>
      <ul>
        <li>Advanced life support technology testing</li>
        <li>Habitat construction equipment</li>
        <li>Resource extraction experiments</li>
        <li>Communication relay satellites</li>
      </ul>
      <p>The first crewed mission is planned for the end of this decade.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200",
      categorySlug: "technology",
      status: "PUBLISHED" as const,
    },
    {
      title: "Central Bank Adjusts Interest Rates",
      slug: "central-bank-adjusts-interest-rates",
      summary: "The monetary policy committee voted to maintain rates amid signs of stable inflation.",
      content: `<p>The Central Bank announced its latest monetary policy decision today, choosing to hold interest rates steady.</p>
      <p>The decision comes as inflation shows signs of stabilizing near the target range.</p>
      <p>"We see encouraging signs that our policies are working," the Bank Governor stated. "However, we remain vigilant."</p>
      <p>Key economic indicators:</p>
      <ul>
        <li>Inflation at 2.3%, within target range</li>
        <li>GDP growth of 3.1% year-over-year</li>
        <li>Unemployment at historic lows</li>
        <li>Consumer confidence rising</li>
      </ul>
      <p>The next policy review is scheduled for next quarter.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200",
      categorySlug: "business",
      status: "PUBLISHED" as const,
    },
  ];

  for (const article of articles) {
    const category = createdCategories.find((c) => c.slug === article.categorySlug);
    if (!category) continue;

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        featuredImage: article.featuredImage,
        status: article.status,
        publishedAt: new Date(),
        categoryId: category.id,
        authorId: admin.id,
      },
    });
  }

  console.log("Created", articles.length, "articles");
  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
