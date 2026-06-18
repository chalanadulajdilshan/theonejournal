import { useState, useEffect } from 'react';

export default function useDynamicPage(slug) {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch(`/api/get_configs.php?key=page_${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.value && data.value.content) {
          setPageData(data.value);
        }
      })
      .catch(() => {});
  }, [slug]);

  return pageData;
}
