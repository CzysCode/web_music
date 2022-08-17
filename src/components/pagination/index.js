import React, { memo } from 'react';

import { Pagination } from 'antd';
import { PaginationWrapper } from './style';

export default memo(function HYPagination(props) {
  const { currentPage, total, onPageChange } = props;

  return (
    <PaginationWrapper>
      <Pagination className="pagination"
        size="small"
        current={currentPage}
        defaultCurrent={1}
        total={total}
        pageSize={20}
        showSizeChanger={false}
        onChange={onPageChange} />
    </PaginationWrapper>
  )
})
