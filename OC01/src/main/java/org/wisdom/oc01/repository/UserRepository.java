package org.wisdom.oc01.repository;


import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.User;
import org.wisdom.oc01.generic.IRepository;

@Repository
public interface UserRepository extends IRepository<User, Integer> {
    User findByAccount_IdAccount(int idAccount);
}
