package org.wisdom.oc01.generic;

import java.util.List;

public interface IService<T, ID> {
    List<T> findAll();
    T findOne(ID id);
    void delete(ID id);
}