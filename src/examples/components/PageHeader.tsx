import { URLS } from '../constants';

interface PageHeaderProps {
  title: string;
  /** Path of the example's source file in the repository. */
  source?: string;
}

export default function PageHeader({ title, source }: PageHeaderProps) {
  return (
    <div className="ex-page-header">
      <h2>{title}</h2>
      {source && (
        <a
          href={`${URLS.githubRepo}/blob/master/src/examples/pages/${source}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          &lt;/&gt; Source Code
        </a>
      )}
    </div>
  );
}
