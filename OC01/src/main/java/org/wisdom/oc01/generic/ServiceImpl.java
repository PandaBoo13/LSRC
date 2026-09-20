package org.wisdom.oc01.generic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wisdom.oc01.dto.response.PermissionResponse;

import java.util.List;
import java.util.Optional;

public abstract class ServiceImpl<T, ID, R extends JpaRepository<T, ID>> implements IService<T, ID> {

    protected final R repository;

    public ServiceImpl(R repository) {
        this.repository = repository;
    }

    @Override
    public List<T> findAll() {
        return repository.findAll();
    }

    @Override
    public T findOne(ID id) {
        Optional<T> entity = repository.findById(id);
        return entity.orElse(null);
    }

    @Override
    public void delete(ID id) {
        repository.deleteById(id);
    }


}